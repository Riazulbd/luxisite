import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { analyzeSeo } from "../services/seoAnalyzer.js";
import {
  buildCanonicalUrl,
  getSettingsMap,
  prepareContentMetrics
} from "../utils/blog.js";

const router = express.Router();

router.post("/analyze", requireAuth, (req, res) => {
  const db = req.app.locals.db;
  let payload = req.body || {};

  if (payload.postId) {
    const row = db.prepare("SELECT * FROM posts WHERE id = ?").get(Number(payload.postId));
    if (!row) {
      return res.status(404).json({ error: "Post not found" });
    }

    payload = {
      title: row.title,
      content: row.content,
      focusKeyword: row.focus_keyword,
      metaTitle: row.meta_title,
      metaDescription: row.meta_description,
      slug: row.slug,
      secondaryKeywords: row.secondary_keywords,
      featuredImage: row.featured_image,
      featuredImageAlt: row.featured_image_alt,
      schemaJson: row.schema_json,
      canonicalUrl: row.canonical_url || buildCanonicalUrl(row.slug),
      ogTitle: row.og_title,
      ogDescription: row.og_description,
      twitterTitle: row.twitter_title,
      twitterDescription: row.twitter_description,
      excerpt: row.excerpt
    };
  }

  const metrics = prepareContentMetrics(payload.content || "");
  const analysis = analyzeSeo({
    title: payload.title,
    content: payload.content,
    contentRaw: metrics.contentRaw,
    slug: payload.slug,
    focusKeyword: payload.focusKeyword || payload.focus_keyword,
    secondaryKeywords: payload.secondaryKeywords || payload.secondary_keywords,
    metaTitle: payload.metaTitle || payload.meta_title,
    metaDescription: payload.metaDescription || payload.meta_description,
    featuredImage: payload.featuredImage || payload.featured_image,
    featuredImageAlt: payload.featuredImageAlt || payload.featured_image_alt,
    schemaJson: payload.schemaJson || payload.schema_json,
    canonicalUrl: payload.canonicalUrl || payload.canonical_url || buildCanonicalUrl(payload.slug || ""),
    ogTitle: payload.ogTitle || payload.og_title,
    ogDescription: payload.ogDescription || payload.og_description,
    twitterTitle: payload.twitterTitle || payload.twitter_title,
    twitterDescription: payload.twitterDescription || payload.twitter_description,
    excerpt: payload.excerpt
  });

  return res.json({ analysis });
});

router.get("/settings", requireAuth, (req, res) => {
  const db = req.app.locals.db;
  const settings = getSettingsMap(db);
  return res.json({ settings });
});

router.put("/settings", requireAuth, (req, res) => {
  const db = req.app.locals.db;
  const settings = req.body?.settings || {};
  const statement = db.prepare(
    `
      INSERT INTO seo_settings (setting_key, setting_value, description, updated_at)
      VALUES (?, ?, COALESCE((SELECT description FROM seo_settings WHERE setting_key = ?), ''), ?)
      ON CONFLICT(setting_key) DO UPDATE SET
        setting_value = excluded.setting_value,
        updated_at = excluded.updated_at
    `
  );
  const now = new Date().toISOString();

  for (const [key, value] of Object.entries(settings)) {
    statement.run(key, String(value), key, now);
  }

  return res.json({ settings: getSettingsMap(db) });
});

export default router;
