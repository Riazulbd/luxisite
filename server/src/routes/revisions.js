import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { analyzeSeo } from "../services/seoAnalyzer.js";
import {
  basePostSelect,
  buildCanonicalUrl,
  createRevision,
  prepareContentMetrics
} from "../utils/blog.js";

const router = express.Router();

function getPost(db, id) {
  return db
    .prepare(
      `
        ${basePostSelect()}
        WHERE p.id = ?
      `
    )
    .get(id);
}

router.get("/posts/:id/revisions", requireAuth, (req, res) => {
  const db = req.app.locals.db;
  const postId = Number(req.params.id);
  const revisions = db
    .prepare(
      `
        SELECT *
        FROM post_revisions
        WHERE post_id = ?
        ORDER BY created_at DESC
        LIMIT 50
      `
    )
    .all(postId);

  return res.json({ revisions });
});

router.get("/posts/:id/revisions/:revId", requireAuth, (req, res) => {
  const db = req.app.locals.db;
  const revision = db
    .prepare(
      "SELECT * FROM post_revisions WHERE id = ? AND post_id = ?"
    )
    .get(Number(req.params.revId), Number(req.params.id));

  if (!revision) {
    return res.status(404).json({ error: "Revision not found" });
  }

  return res.json({ revision });
});

router.post("/posts/:id/revisions/:revId/restore", requireAuth, (req, res) => {
  const db = req.app.locals.db;
  const postId = Number(req.params.id);
  const revision = db
    .prepare(
      "SELECT * FROM post_revisions WHERE id = ? AND post_id = ?"
    )
    .get(Number(req.params.revId), postId);

  if (!revision) {
    return res.status(404).json({ error: "Revision not found" });
  }

  const post = getPost(db, postId);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  const metrics = prepareContentMetrics(revision.content);
  const analysis = analyzeSeo({
    title: revision.title,
    content: revision.content,
    contentRaw: metrics.contentRaw,
    slug: post.slug,
    focusKeyword: post.focus_keyword,
    secondaryKeywords: post.secondary_keywords,
    metaTitle: revision.meta_title || post.meta_title,
    metaDescription: revision.meta_description || post.meta_description,
    featuredImage: post.featured_image,
    featuredImageAlt: post.featured_image_alt,
    schemaJson: post.schema_json,
    canonicalUrl: post.canonical_url || buildCanonicalUrl(post.slug),
    ogTitle: post.og_title,
    ogDescription: post.og_description,
    ogImage: post.og_image,
    twitterTitle: post.twitter_title,
    twitterDescription: post.twitter_description,
    twitterImage: post.twitter_image,
    excerpt: revision.excerpt || post.excerpt
  });

  db.prepare(
    `
      UPDATE posts
      SET
        title = ?,
        content = ?,
        content_raw = ?,
        excerpt = ?,
        meta_title = ?,
        meta_description = ?,
        reading_time = ?,
        word_count = ?,
        seo_score = ?,
        readability_score = ?,
        technical_seo_score = ?,
        updated_at = ?
      WHERE id = ?
    `
  ).run(
    revision.title,
    revision.content,
    metrics.contentRaw,
    revision.excerpt || post.excerpt,
    revision.meta_title || post.meta_title,
    revision.meta_description || post.meta_description,
    metrics.readingTime,
    metrics.wordCount,
    analysis.overallScore,
    analysis.readabilityScore,
    analysis.technicalSeoScore,
    new Date().toISOString(),
    postId
  );

  createRevision(
    db,
    postId,
    {
      ...post,
      title: revision.title,
      content: revision.content,
      excerpt: revision.excerpt || post.excerpt,
      meta_title: revision.meta_title || post.meta_title,
      meta_description: revision.meta_description || post.meta_description
    },
    "manual",
    `Restored revision #${revision.id}`
  );

  return res.json({ success: true, analysis });
});

export default router;
