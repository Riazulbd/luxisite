import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  attachTagsToPosts,
  basePostSelect,
  buildPagination,
  generateUniqueSlug,
  syncTagCounts
} from "../utils/blog.js";

const router = express.Router();

router.get("/", (req, res) => {
  const db = req.app.locals.db;
  syncTagCounts(db);
  const tags = db
    .prepare("SELECT * FROM tags ORDER BY post_count DESC, name ASC")
    .all();
  return res.json({ tags });
});

router.get("/search", (req, res) => {
  const db = req.app.locals.db;
  const query = String(req.query.q || "").trim();
  if (!query) {
    return res.json({ tags: [] });
  }

  const tags = db
    .prepare(
      `
        SELECT *
        FROM tags
        WHERE name LIKE ? OR slug LIKE ?
        ORDER BY post_count DESC, name ASC
        LIMIT 10
      `
    )
    .all(`%${query}%`, `%${query}%`);

  return res.json({ tags });
});

router.get("/:slug", (req, res) => {
  const db = req.app.locals.db;
  const tag = db.prepare("SELECT * FROM tags WHERE slug = ?").get(req.params.slug);

  if (!tag) {
    return res.status(404).json({ error: "Tag not found" });
  }

  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));
  const offset = (page - 1) * limit;

  const total = db
    .prepare(
      `
        SELECT COUNT(*) AS count
        FROM post_tags pt
        JOIN posts p ON p.id = pt.post_id
        WHERE pt.tag_id = ? AND p.status = 'published'
      `
    )
    .get(tag.id).count;

  const rows = db
    .prepare(
      `
        ${basePostSelect()}
        JOIN post_tags pt ON pt.post_id = p.id
        WHERE pt.tag_id = ? AND p.status = 'published'
        ORDER BY COALESCE(p.published_at, p.created_at) DESC
        LIMIT ? OFFSET ?
      `
    )
    .all(tag.id, limit, offset);

  return res.json({
    tag,
    posts: attachTagsToPosts(db, rows),
    pagination: buildPagination(page, limit, total)
  });
});

router.post("/", requireAuth, (req, res) => {
  const db = req.app.locals.db;
  const name = req.body?.name?.trim();
  if (!name) {
    return res.status(400).json({ error: "Tag name is required" });
  }

  const slug = generateUniqueSlug(db, "tags", req.body.slug || name);
  const info = db
    .prepare("INSERT INTO tags (name, slug, description) VALUES (?, ?, ?)")
    .run(name, slug, req.body.description || "");
  const tag = db.prepare("SELECT * FROM tags WHERE id = ?").get(info.lastInsertRowid);
  return res.status(201).json({ tag });
});

router.put("/:id", requireAuth, (req, res) => {
  const db = req.app.locals.db;
  const id = Number(req.params.id);
  const existing = db.prepare("SELECT * FROM tags WHERE id = ?").get(id);

  if (!existing) {
    return res.status(404).json({ error: "Tag not found" });
  }

  const name = req.body.name?.trim() || existing.name;
  const slug = req.body.slug
    ? generateUniqueSlug(db, "tags", req.body.slug, id)
    : existing.slug;

  db.prepare(
    "UPDATE tags SET name = ?, slug = ?, description = ? WHERE id = ?"
  ).run(name, slug, req.body.description ?? existing.description, id);

  const tag = db.prepare("SELECT * FROM tags WHERE id = ?").get(id);
  return res.json({ tag });
});

router.delete("/:id", requireAuth, (req, res) => {
  const db = req.app.locals.db;
  const id = Number(req.params.id);
  const existing = db.prepare("SELECT * FROM tags WHERE id = ?").get(id);

  if (!existing) {
    return res.status(404).json({ error: "Tag not found" });
  }

  db.prepare("DELETE FROM post_tags WHERE tag_id = ?").run(id);
  db.prepare("DELETE FROM tags WHERE id = ?").run(id);
  syncTagCounts(db);
  return res.json({ success: true });
});

export default router;
