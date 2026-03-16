import express from "express";
import { analyzeSeo } from "../services/seoAnalyzer.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";
import {
  attachTagsToPosts,
  basePostSelect,
  buildCanonicalUrl,
  buildPagination,
  createRevision,
  extractUploadCandidates,
  generateUniqueSlug,
  getUncategorizedId,
  normalizeKeywordList,
  prepareContentMetrics,
  removeFileIfExists,
  replacePostTags,
  resolveUploadPath,
  safeJsonParse,
  syncTaxonomyCounts
} from "../utils/blog.js";

const router = express.Router();

const SORT_FIELDS = {
  published_at: "COALESCE(p.published_at, p.created_at)",
  created_at: "p.created_at",
  updated_at: "p.updated_at",
  seo_score: "p.seo_score",
  view_count: "p.view_count"
};

function toNumber(value, fallback = null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getPostById(db, id) {
  const rows = db
    .prepare(
      `
        ${basePostSelect()}
        WHERE p.id = ?
      `
    )
    .all(id);
  return attachTagsToPosts(db, rows)[0] || null;
}

function getPostBySlug(db, slug) {
  const rows = db
    .prepare(
      `
        ${basePostSelect()}
        WHERE p.slug = ?
      `
    )
    .all(slug);
  return attachTagsToPosts(db, rows)[0] || null;
}

function buildListClauses({ category, tag, search, status, adminMode = false }) {
  const joins = [];
  const where = [];
  const params = [];

  if (!adminMode) {
    where.push("p.status = 'published'");
  } else if (status && status !== "all") {
    where.push("p.status = ?");
    params.push(status);
  }

  if (category) {
    where.push("c.slug = ?");
    params.push(category);
  }

  if (tag) {
    joins.push("JOIN post_tags fpt ON fpt.post_id = p.id");
    joins.push("JOIN tags ft ON ft.id = fpt.tag_id");
    where.push("ft.slug = ?");
    params.push(tag);
  }

  if (search) {
    where.push("(p.title LIKE ? OR p.content_raw LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }

  return { joins, where, params };
}

function normalizePostInput(db, body, existing = null, userId = 1) {
  const title = String(body.title ?? existing?.title ?? "").trim() || "Untitled";
  const content = String(body.content ?? existing?.content ?? "").trim();
  const requestedSlug = String(body.slug ?? existing?.slug ?? title).trim();
  const slug = generateUniqueSlug(db, "posts", requestedSlug || title, existing?.id || null);
  const metrics = prepareContentMetrics(content);
  const secondaryKeywords = normalizeKeywordList(
    body.secondary_keywords ?? body.secondaryKeywords ?? existing?.secondary_keywords ?? []
  );
  const categoryId = toNumber(
    body.category_id ?? body.categoryId ?? existing?.category_id,
    getUncategorizedId(db)
  );
  const canonicalUrl =
    body.canonical_url ??
    body.canonicalUrl ??
    existing?.canonical_url ??
    buildCanonicalUrl(slug);

  const record = {
    title,
    slug,
    excerpt: body.excerpt ?? existing?.excerpt ?? "",
    content,
    content_raw: metrics.contentRaw,
    featured_image: body.featured_image ?? body.featuredImage ?? existing?.featured_image ?? "",
    featured_image_alt:
      body.featured_image_alt ?? body.featuredImageAlt ?? existing?.featured_image_alt ?? "",
    featured_image_caption:
      body.featured_image_caption ?? body.featuredImageCaption ?? existing?.featured_image_caption ?? "",
    category_id: categoryId,
    author_id: existing?.author_id || userId,
    status: body.status ?? existing?.status ?? "draft",
    published_at: body.published_at ?? existing?.published_at ?? null,
    scheduled_at: body.scheduled_at ?? existing?.scheduled_at ?? null,
    reading_time: metrics.readingTime,
    word_count: metrics.wordCount,
    view_count: existing?.view_count ?? 0,
    meta_title: body.meta_title ?? body.metaTitle ?? existing?.meta_title ?? "",
    meta_description:
      body.meta_description ?? body.metaDescription ?? existing?.meta_description ?? "",
    focus_keyword: body.focus_keyword ?? body.focusKeyword ?? existing?.focus_keyword ?? "",
    secondary_keywords: JSON.stringify(secondaryKeywords),
    canonical_url: canonicalUrl,
    og_title: body.og_title ?? body.ogTitle ?? existing?.og_title ?? "",
    og_description: body.og_description ?? body.ogDescription ?? existing?.og_description ?? "",
    og_image: body.og_image ?? body.ogImage ?? existing?.og_image ?? "",
    twitter_title:
      body.twitter_title ?? body.twitterTitle ?? existing?.twitter_title ?? "",
    twitter_description:
      body.twitter_description ??
      body.twitterDescription ??
      existing?.twitter_description ??
      "",
    twitter_image:
      body.twitter_image ?? body.twitterImage ?? existing?.twitter_image ?? "",
    schema_type: body.schema_type ?? body.schemaType ?? existing?.schema_type ?? "BlogPosting",
    schema_json: body.schema_json ?? body.schemaJson ?? existing?.schema_json ?? "",
    ai_generated_slug:
      body.ai_generated_slug ?? existing?.ai_generated_slug ?? "",
    ai_summary: body.ai_summary ?? existing?.ai_summary ?? "",
    ai_keywords:
      typeof (body.ai_keywords ?? body.aiKeywords) === "string"
        ? body.ai_keywords ?? body.aiKeywords
        : JSON.stringify(body.ai_keywords ?? body.aiKeywords ?? safeJsonParse(existing?.ai_keywords, [])),
    ai_seo_suggestions:
      typeof (body.ai_seo_suggestions ?? body.aiSeoSuggestions) === "string"
        ? body.ai_seo_suggestions ?? body.aiSeoSuggestions
        : JSON.stringify(
            body.ai_seo_suggestions ??
              body.aiSeoSuggestions ??
              safeJsonParse(existing?.ai_seo_suggestions, null)
          ),
    ai_improved_content:
      body.ai_improved_content ??
      body.aiImprovedContent ??
      existing?.ai_improved_content ??
      ""
  };

  const analysis = analyzeSeo({
    title: record.title,
    content: record.content,
    contentRaw: record.content_raw,
    slug: record.slug,
    focusKeyword: record.focus_keyword,
    secondaryKeywords,
    metaTitle: record.meta_title,
    metaDescription: record.meta_description,
    featuredImage: record.featured_image,
    featuredImageAlt: record.featured_image_alt,
    schemaJson: record.schema_json,
    canonicalUrl: record.canonical_url,
    ogTitle: record.og_title,
    ogDescription: record.og_description,
    twitterTitle: record.twitter_title,
    twitterDescription: record.twitter_description,
    excerpt: record.excerpt
  });

  record.seo_score = analysis.overallScore;
  record.readability_score = analysis.readabilityScore;
  record.technical_seo_score = analysis.technicalSeoScore;

  return { record, analysis };
}

function savePostRecord(db, record, existingId = null) {
  const now = new Date().toISOString();
  if (existingId) {
    db.prepare(
      `
        UPDATE posts SET
          title = ?,
          slug = ?,
          excerpt = ?,
          content = ?,
          content_raw = ?,
          featured_image = ?,
          featured_image_alt = ?,
          featured_image_caption = ?,
          category_id = ?,
          author_id = ?,
          status = ?,
          published_at = ?,
          scheduled_at = ?,
          reading_time = ?,
          word_count = ?,
          view_count = ?,
          meta_title = ?,
          meta_description = ?,
          focus_keyword = ?,
          secondary_keywords = ?,
          canonical_url = ?,
          og_title = ?,
          og_description = ?,
          og_image = ?,
          twitter_title = ?,
          twitter_description = ?,
          twitter_image = ?,
          schema_type = ?,
          schema_json = ?,
          seo_score = ?,
          readability_score = ?,
          technical_seo_score = ?,
          ai_generated_slug = ?,
          ai_summary = ?,
          ai_keywords = ?,
          ai_seo_suggestions = ?,
          ai_improved_content = ?,
          updated_at = ?
        WHERE id = ?
      `
    ).run(
      record.title,
      record.slug,
      record.excerpt,
      record.content,
      record.content_raw,
      record.featured_image,
      record.featured_image_alt,
      record.featured_image_caption,
      record.category_id,
      record.author_id,
      record.status,
      record.published_at,
      record.scheduled_at,
      record.reading_time,
      record.word_count,
      record.view_count,
      record.meta_title,
      record.meta_description,
      record.focus_keyword,
      record.secondary_keywords,
      record.canonical_url,
      record.og_title,
      record.og_description,
      record.og_image,
      record.twitter_title,
      record.twitter_description,
      record.twitter_image,
      record.schema_type,
      record.schema_json,
      record.seo_score,
      record.readability_score,
      record.technical_seo_score,
      record.ai_generated_slug,
      record.ai_summary,
      record.ai_keywords,
      record.ai_seo_suggestions,
      record.ai_improved_content,
      now,
      existingId
    );

    return existingId;
  }

  const info = db.prepare(
    `
      INSERT INTO posts (
        title,
        slug,
        excerpt,
        content,
        content_raw,
        featured_image,
        featured_image_alt,
        featured_image_caption,
        category_id,
        author_id,
        status,
        published_at,
        scheduled_at,
        reading_time,
        word_count,
        view_count,
        meta_title,
        meta_description,
        focus_keyword,
        secondary_keywords,
        canonical_url,
        og_title,
        og_description,
        og_image,
        twitter_title,
        twitter_description,
        twitter_image,
        schema_type,
        schema_json,
        seo_score,
        readability_score,
        technical_seo_score,
        ai_generated_slug,
        ai_summary,
        ai_keywords,
        ai_seo_suggestions,
        ai_improved_content,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
  ).run(
    record.title,
    record.slug,
    record.excerpt,
    record.content,
    record.content_raw,
    record.featured_image,
    record.featured_image_alt,
    record.featured_image_caption,
    record.category_id,
    record.author_id,
    record.status,
    record.published_at,
    record.scheduled_at,
    record.reading_time,
    record.word_count,
    record.view_count,
    record.meta_title,
    record.meta_description,
    record.focus_keyword,
    record.secondary_keywords,
    record.canonical_url,
    record.og_title,
    record.og_description,
    record.og_image,
    record.twitter_title,
    record.twitter_description,
    record.twitter_image,
    record.schema_type,
    record.schema_json,
    record.seo_score,
    record.readability_score,
    record.technical_seo_score,
    record.ai_generated_slug,
    record.ai_summary,
    record.ai_keywords,
    record.ai_seo_suggestions,
    record.ai_improved_content,
    now
  );

  return info.lastInsertRowid;
}

function applyTags(db, postId, body, existing) {
  const tagsInput = body.tags ?? existing?.tags ?? [];
  replacePostTags(db, postId, tagsInput);
  syncTaxonomyCounts(db);
}

router.get("/", (req, res) => {
  const db = req.app.locals.db;
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));
  const offset = (page - 1) * limit;
  const sortKey = SORT_FIELDS[req.query.sort] || SORT_FIELDS.published_at;
  const order = String(req.query.order || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";
  const filters = buildListClauses({
    category: req.query.category,
    tag: req.query.tag,
    search: req.query.search,
    adminMode: false
  });

  const fromClause = `
    FROM posts p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN users u ON u.id = p.author_id
    ${filters.joins.join(" ")}
  `;
  const whereClause = filters.where.length ? `WHERE ${filters.where.join(" AND ")}` : "";

  const total = db
    .prepare(`SELECT COUNT(DISTINCT p.id) AS count ${fromClause} ${whereClause}`)
    .get(...filters.params).count;

  const rows = db
    .prepare(
      `
        ${basePostSelect()}
        ${filters.joins.join(" ")}
        ${whereClause}
        GROUP BY p.id
        ORDER BY ${sortKey} ${order}
        LIMIT ? OFFSET ?
      `
    )
    .all(...filters.params, limit, offset);

  return res.json({
    posts: attachTagsToPosts(db, rows),
    pagination: buildPagination(page, limit, total)
  });
});

router.get("/admin", requireAuth, (req, res) => {
  const db = req.app.locals.db;
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));
  const offset = (page - 1) * limit;
  const sortKey = SORT_FIELDS[req.query.sort] || SORT_FIELDS.updated_at;
  const order = String(req.query.order || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";
  const filters = buildListClauses({
    category: req.query.category,
    tag: req.query.tag,
    search: req.query.search,
    status: req.query.status,
    adminMode: true
  });

  const fromClause = `
    FROM posts p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN users u ON u.id = p.author_id
    ${filters.joins.join(" ")}
  `;
  const whereClause = filters.where.length ? `WHERE ${filters.where.join(" AND ")}` : "";

  const total = db
    .prepare(`SELECT COUNT(DISTINCT p.id) AS count ${fromClause} ${whereClause}`)
    .get(...filters.params).count;

  const rows = db
    .prepare(
      `
        ${basePostSelect()}
        ${filters.joins.join(" ")}
        ${whereClause}
        GROUP BY p.id
        ORDER BY ${sortKey} ${order}
        LIMIT ? OFFSET ?
      `
    )
    .all(...filters.params, limit, offset);

  return res.json({
    posts: attachTagsToPosts(db, rows),
    pagination: buildPagination(page, limit, total)
  });
});

router.get("/:id/edit", requireAuth, (req, res) => {
  const db = req.app.locals.db;
  const post = getPostById(db, Number(req.params.id));

  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  return res.json({ post });
});

router.get("/:id/related", (req, res) => {
  const db = req.app.locals.db;
  const currentPost = getPostById(db, Number(req.params.id));

  if (!currentPost) {
    return res.status(404).json({ error: "Post not found" });
  }

  const rows = db
    .prepare(
      `
        ${basePostSelect()}
        LEFT JOIN post_tags pt ON pt.post_id = p.id
        WHERE p.id != ? AND p.status = 'published' AND (
          p.category_id = ? OR pt.tag_id IN (
            SELECT tag_id FROM post_tags WHERE post_id = ?
          )
        )
        GROUP BY p.id
        ORDER BY (p.category_id = ?) DESC, p.view_count DESC, COALESCE(p.published_at, p.created_at) DESC
        LIMIT 4
      `
    )
    .all(currentPost.id, currentPost.category_id, currentPost.id, currentPost.category_id);

  return res.json({ posts: attachTagsToPosts(db, rows) });
});

router.post("/", requireAuth, (req, res) => {
  const db = req.app.locals.db;
  const { record, analysis } = normalizePostInput(db, req.body || {}, null, req.user.id);
  const postId = savePostRecord(db, record);
  applyTags(db, postId, req.body || {}, null);
  const saved = getPostById(db, postId);
  createRevision(db, postId, saved, "manual", "Initial draft created");
  return res.status(201).json({ post: saved, analysis });
});

router.put("/:id", requireAuth, (req, res) => {
  const db = req.app.locals.db;
  const postId = Number(req.params.id);
  const existing = getPostById(db, postId);

  if (!existing) {
    return res.status(404).json({ error: "Post not found" });
  }

  createRevision(db, postId, existing, "manual", "Revision before update");
  const { record, analysis } = normalizePostInput(db, req.body || {}, existing, existing.author?.id || req.user.id);
  savePostRecord(db, record, postId);
  applyTags(db, postId, req.body || {}, existing);
  const saved = getPostById(db, postId);
  return res.json({ post: saved, analysis });
});

router.delete("/:id/permanent", requireAuth, (req, res) => {
  const db = req.app.locals.db;
  const postId = Number(req.params.id);
  const existing = getPostById(db, postId);

  if (!existing) {
    return res.status(404).json({ error: "Post not found" });
  }

  for (const uploadPath of extractUploadCandidates(existing)) {
    removeFileIfExists(resolveUploadPath(uploadPath));
    removeFileIfExists(resolveUploadPath(uploadPath.replace(/\.webp$/, "-thumb.webp")));
  }

  db.prepare("DELETE FROM posts WHERE id = ?").run(postId);
  syncTaxonomyCounts(db);
  return res.json({ success: true });
});

router.delete("/:id", requireAuth, (req, res) => {
  const db = req.app.locals.db;
  const postId = Number(req.params.id);
  const existing = getPostById(db, postId);

  if (!existing) {
    return res.status(404).json({ error: "Post not found" });
  }

  db.prepare("UPDATE posts SET status = 'trash', updated_at = ? WHERE id = ?").run(
    new Date().toISOString(),
    postId
  );
  syncTaxonomyCounts(db);
  return res.json({ success: true });
});

router.post("/:id/publish", requireAuth, (req, res) => {
  const db = req.app.locals.db;
  const postId = Number(req.params.id);
  const existing = getPostById(db, postId);

  if (!existing) {
    return res.status(404).json({ error: "Post not found" });
  }

  const publishedAt = new Date().toISOString();
  const { record, analysis } = normalizePostInput(
    db,
    { ...req.body, status: "published", published_at: publishedAt, scheduled_at: null },
    existing,
    existing.author?.id || req.user.id
  );
  savePostRecord(db, record, postId);
  applyTags(db, postId, req.body || {}, existing);
  const saved = getPostById(db, postId);
  createRevision(db, postId, saved, "publish", "Post published");
  return res.json({ post: saved, analysis });
});

router.post("/:id/schedule", requireAuth, (req, res) => {
  const db = req.app.locals.db;
  const postId = Number(req.params.id);
  const existing = getPostById(db, postId);

  if (!existing) {
    return res.status(404).json({ error: "Post not found" });
  }

  const scheduledAt = req.body?.scheduled_at;
  if (!scheduledAt) {
    return res.status(400).json({ error: "scheduled_at is required" });
  }

  const { record, analysis } = normalizePostInput(
    db,
    { ...req.body, status: "scheduled", scheduled_at: scheduledAt },
    existing,
    existing.author?.id || req.user.id
  );
  savePostRecord(db, record, postId);
  applyTags(db, postId, req.body || {}, existing);
  const saved = getPostById(db, postId);
  return res.json({ post: saved, analysis });
});

router.post("/:id/draft", requireAuth, (req, res) => {
  const db = req.app.locals.db;
  const postId = Number(req.params.id);
  const existing = getPostById(db, postId);

  if (!existing) {
    return res.status(404).json({ error: "Post not found" });
  }

  const { record, analysis } = normalizePostInput(
    db,
    { ...req.body, status: "draft", scheduled_at: null },
    existing,
    existing.author?.id || req.user.id
  );
  savePostRecord(db, record, postId);
  applyTags(db, postId, req.body || {}, existing);
  const saved = getPostById(db, postId);
  return res.json({ post: saved, analysis });
});

router.post("/:id/autosave", requireAuth, (req, res) => {
  const db = req.app.locals.db;
  const postId = Number(req.params.id);
  const existing = getPostById(db, postId);

  if (!existing) {
    return res.status(404).json({ error: "Post not found" });
  }

  const { record, analysis } = normalizePostInput(
    db,
    { ...req.body, status: existing.status || "draft" },
    existing,
    existing.author?.id || req.user.id
  );
  savePostRecord(db, record, postId);
  applyTags(db, postId, req.body || {}, existing);
  const saved = getPostById(db, postId);
  createRevision(db, postId, saved, "autosave", "Autosave");
  return res.json({ post: saved, analysis });
});

router.get("/:slug", optionalAuth, (req, res) => {
  const db = req.app.locals.db;
  const post = getPostBySlug(db, req.params.slug);

  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  const isPreview = req.query.preview === "true" && req.user;
  if (!isPreview && post.status !== "published") {
    return res.status(404).json({ error: "Post not found" });
  }

  if (!isPreview) {
    db.prepare("UPDATE posts SET view_count = view_count + 1 WHERE id = ?").run(post.id);
  }

  const fresh = getPostBySlug(db, req.params.slug);
  return res.json({ post: fresh });
});

export default router;
