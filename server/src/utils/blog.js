import fs from "fs";
import path from "path";

const SITE_URL = process.env.SITE_URL || "https://automationpaths.com";

export function slugify(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 75);
}

export function generateUniqueSlug(db, table, value, currentId = null) {
  const baseSlug = slugify(value) || "untitled";
  let slug = baseSlug;
  let counter = 2;

  while (true) {
    const row = currentId
      ? db
          .prepare(`SELECT id FROM ${table} WHERE slug = ? AND id != ?`)
          .get(slug, currentId)
      : db.prepare(`SELECT id FROM ${table} WHERE slug = ?`).get(slug);

    if (!row) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
}

export function stripHtml(html = "") {
  return String(html)
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function countWords(text = "") {
  return String(text)
    .split(/\s+/)
    .filter(Boolean).length;
}

export function calculateReadingTime(wordCount) {
  if (!wordCount) {
    return 0;
  }

  return Math.max(1, Math.ceil(wordCount / 200));
}

export function safeJsonParse(value, fallback = null) {
  if (!value) {
    return fallback;
  }

  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

export function normalizeKeywordList(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    const parsed = safeJsonParse(value);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim()).filter(Boolean);
    }

    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

export function normalizeTagsInput(tags) {
  if (!tags) {
    return [];
  }

  const source = Array.isArray(tags) ? tags : safeJsonParse(tags, []);
  return source
    .map((tag) => {
      if (!tag) {
        return null;
      }

      if (typeof tag === "string") {
        return { name: tag.trim() };
      }

      return {
        id: tag.id ? Number(tag.id) : null,
        name: tag.name ? String(tag.name).trim() : null,
        slug: tag.slug ? String(tag.slug).trim() : null
      };
    })
    .filter((tag) => tag && (tag.id || tag.name));
}

export function parseBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value > 0;
  }

  return String(value).toLowerCase() === "true";
}

export function getSettingsMap(db) {
  const rows = db.prepare("SELECT setting_key, setting_value FROM seo_settings").all();
  return rows.reduce((acc, row) => {
    acc[row.setting_key] = row.setting_value;
    return acc;
  }, {});
}

export function getUncategorizedId(db) {
  const row = db
    .prepare("SELECT id FROM categories WHERE slug = ?")
    .get("uncategorized");
  return row?.id || 1;
}

export function syncCategoryCounts(db) {
  const categories = db.prepare("SELECT id FROM categories").all();
  const countStatement = db.prepare(
    "SELECT COUNT(*) AS count FROM posts WHERE category_id = ? AND status != 'trash'"
  );
  const updateStatement = db.prepare(
    "UPDATE categories SET post_count = ? WHERE id = ?"
  );

  for (const category of categories) {
    const count = countStatement.get(category.id)?.count || 0;
    updateStatement.run(count, category.id);
  }
}

export function syncTagCounts(db) {
  const tags = db.prepare("SELECT id FROM tags").all();
  const countStatement = db.prepare(
    `
      SELECT COUNT(*) AS count
      FROM post_tags pt
      JOIN posts p ON p.id = pt.post_id
      WHERE pt.tag_id = ? AND p.status != 'trash'
    `
  );
  const updateStatement = db.prepare(
    "UPDATE tags SET post_count = ? WHERE id = ?"
  );

  for (const tag of tags) {
    const count = countStatement.get(tag.id)?.count || 0;
    updateStatement.run(count, tag.id);
  }
}

export function syncTaxonomyCounts(db) {
  syncCategoryCounts(db);
  syncTagCounts(db);
}

export function ensureTags(db, tagsInput) {
  const tags = normalizeTagsInput(tagsInput);
  const insertTag = db.prepare(
    "INSERT INTO tags (name, slug, description) VALUES (?, ?, ?)"
  );
  const getById = db.prepare("SELECT * FROM tags WHERE id = ?");
  const getBySlug = db.prepare("SELECT * FROM tags WHERE slug = ?");
  const results = [];

  for (const tag of tags) {
    if (tag.id) {
      const existing = getById.get(tag.id);
      if (existing) {
        results.push(existing);
      }
      continue;
    }

    const name = tag.name || tag.slug || "tag";
    const slug = generateUniqueSlug(db, "tags", tag.slug || name);
    let existing = getBySlug.get(slug);
    if (!existing) {
      const info = insertTag.run(name, slug, null);
      existing = getById.get(info.lastInsertRowid);
    }
    results.push(existing);
  }

  return results;
}

export function replacePostTags(db, postId, tagsInput) {
  const tags = ensureTags(db, tagsInput);
  db.prepare("DELETE FROM post_tags WHERE post_id = ?").run(postId);
  const insertRelation = db.prepare(
    "INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)"
  );

  for (const tag of tags) {
    insertRelation.run(postId, tag.id);
  }

  syncTagCounts(db);
  return tags;
}

export function createRevision(db, postId, post, revisionType = "manual", revisionNote = null) {
  if (!postId || !post) {
    return;
  }

  db.prepare(
    `
      INSERT INTO post_revisions (
        post_id,
        title,
        content,
        excerpt,
        meta_title,
        meta_description,
        revision_type,
        revision_note
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `
  ).run(
    postId,
    post.title || "",
    post.content || "",
    post.excerpt || "",
    post.meta_title || post.metaTitle || "",
    post.meta_description || post.metaDescription || "",
    revisionType,
    revisionNote
  );
}

export function serializePost(row) {
  if (!row) {
    return null;
  }

  return {
    ...row,
    secondary_keywords: normalizeKeywordList(row.secondary_keywords),
    ai_keywords: safeJsonParse(row.ai_keywords, []),
    ai_seo_suggestions: safeJsonParse(row.ai_seo_suggestions, null),
    category: row.category_id
      ? {
          id: row.category_id,
          name: row.category_name,
          slug: row.category_slug,
          color: row.category_color
        }
      : null,
    author: row.author_id
      ? {
          id: row.author_id,
          name: row.author_name,
          avatar: row.author_avatar
        }
      : null
  };
}

export function attachTagsToPosts(db, rows) {
  if (!rows.length) {
    return [];
  }

  const postIds = rows.map((row) => row.id);
  const placeholders = postIds.map(() => "?").join(", ");
  const tagRows = db
    .prepare(
      `
        SELECT pt.post_id, t.id, t.name, t.slug, t.post_count
        FROM post_tags pt
        JOIN tags t ON t.id = pt.tag_id
        WHERE pt.post_id IN (${placeholders})
        ORDER BY t.name ASC
      `
    )
    .all(...postIds);

  const tagsByPostId = new Map();
  for (const tagRow of tagRows) {
    if (!tagsByPostId.has(tagRow.post_id)) {
      tagsByPostId.set(tagRow.post_id, []);
    }
    tagsByPostId.get(tagRow.post_id).push({
      id: tagRow.id,
      name: tagRow.name,
      slug: tagRow.slug,
      post_count: tagRow.post_count
    });
  }

  return rows.map((row) => ({
    ...serializePost(row),
    tags: tagsByPostId.get(row.id) || []
  }));
}

export function basePostSelect() {
  return `
    SELECT
      p.*,
      c.name AS category_name,
      c.slug AS category_slug,
      c.color AS category_color,
      u.name AS author_name,
      u.avatar AS author_avatar
    FROM posts p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN users u ON u.id = p.author_id
  `;
}

export function prepareContentMetrics(content = "") {
  const contentRaw = stripHtml(content);
  const wordCount = countWords(contentRaw);
  const readingTime = calculateReadingTime(wordCount);

  return { contentRaw, wordCount, readingTime };
}

export function buildCanonicalUrl(slug) {
  return `${SITE_URL.replace(/\/$/, "")}/blog/${slug}`;
}

export function removeFileIfExists(filePath) {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

export function resolveUploadPath(relativePath) {
  if (!relativePath) {
    return null;
  }

  return path.resolve(process.cwd(), relativePath.replace(/^\//, ""));
}

export function extractUploadCandidates(post) {
  const candidates = new Set();
  const fields = [post.featured_image, post.og_image, post.twitter_image];

  for (const field of fields) {
    if (field && field.startsWith("/uploads/")) {
      candidates.add(field);
    }
  }

  return Array.from(candidates);
}

export function buildPagination(page, limit, total) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
}
