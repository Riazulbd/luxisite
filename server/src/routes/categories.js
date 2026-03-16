import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  attachTagsToPosts,
  basePostSelect,
  buildPagination,
  generateUniqueSlug,
  getUncategorizedId,
  syncCategoryCounts
} from "../utils/blog.js";

const router = express.Router();

function buildTree(categories, parentId = null) {
  return categories
    .filter((category) => (category.parent_id || null) === parentId)
    .map((category) => ({
      ...category,
      children: buildTree(categories, category.id)
    }));
}

router.get("/", (req, res) => {
  const db = req.app.locals.db;
  syncCategoryCounts(db);
  const categories = db
    .prepare(
      `
        SELECT *
        FROM categories
        ORDER BY sort_order ASC, name ASC
      `
    )
    .all();

  if (req.query.tree === "true") {
    return res.json({ categories: buildTree(categories) });
  }

  return res.json({ categories });
});

router.get("/:slug", (req, res) => {
  const db = req.app.locals.db;
  const category = db
    .prepare("SELECT * FROM categories WHERE slug = ?")
    .get(req.params.slug);

  if (!category) {
    return res.status(404).json({ error: "Category not found" });
  }

  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));
  const offset = (page - 1) * limit;

  const total = db
    .prepare(
      "SELECT COUNT(*) AS count FROM posts WHERE category_id = ? AND status = 'published'"
    )
    .get(category.id).count;

  const rows = db
    .prepare(
      `
        ${basePostSelect()}
        WHERE p.category_id = ? AND p.status = 'published'
        ORDER BY COALESCE(p.published_at, p.created_at) DESC
        LIMIT ? OFFSET ?
      `
    )
    .all(category.id, limit, offset);

  return res.json({
    category,
    posts: attachTagsToPosts(db, rows),
    pagination: buildPagination(page, limit, total)
  });
});

router.post("/", requireAuth, (req, res) => {
  const db = req.app.locals.db;
  const { name, description = "", color = "#C8742A", parent_id = null, meta_title = "", meta_description = "" } =
    req.body || {};

  if (!name?.trim()) {
    return res.status(400).json({ error: "Category name is required" });
  }

  const slug = generateUniqueSlug(db, "categories", name);
  const info = db
    .prepare(
      `
        INSERT INTO categories (
          name, slug, description, color, parent_id, meta_title, meta_description
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `
    )
    .run(
      name.trim(),
      slug,
      description,
      color,
      parent_id || null,
      meta_title,
      meta_description
    );

  const category = db
    .prepare("SELECT * FROM categories WHERE id = ?")
    .get(info.lastInsertRowid);

  return res.status(201).json({ category });
});

router.put("/:id", requireAuth, (req, res) => {
  const db = req.app.locals.db;
  const id = Number(req.params.id);
  const existing = db.prepare("SELECT * FROM categories WHERE id = ?").get(id);

  if (!existing) {
    return res.status(404).json({ error: "Category not found" });
  }

  const name = req.body.name?.trim() || existing.name;
  const slug = req.body.slug
    ? generateUniqueSlug(db, "categories", req.body.slug, id)
    : existing.slug;

  db.prepare(
    `
      UPDATE categories
      SET name = ?, slug = ?, description = ?, color = ?, parent_id = ?, meta_title = ?, meta_description = ?, sort_order = ?
      WHERE id = ?
    `
  ).run(
    name,
    slug,
    req.body.description ?? existing.description,
    req.body.color ?? existing.color,
    req.body.parent_id ?? existing.parent_id,
    req.body.meta_title ?? existing.meta_title,
    req.body.meta_description ?? existing.meta_description,
    req.body.sort_order ?? existing.sort_order,
    id
  );

  const category = db.prepare("SELECT * FROM categories WHERE id = ?").get(id);
  return res.json({ category });
});

router.delete("/:id", requireAuth, (req, res) => {
  const db = req.app.locals.db;
  const id = Number(req.params.id);
  const existing = db.prepare("SELECT * FROM categories WHERE id = ?").get(id);

  if (!existing) {
    return res.status(404).json({ error: "Category not found" });
  }

  const uncategorizedId = getUncategorizedId(db);
  if (id === uncategorizedId) {
    return res.status(400).json({ error: "The uncategorized category cannot be deleted" });
  }

  db.prepare("UPDATE posts SET category_id = ? WHERE category_id = ?").run(
    uncategorizedId,
    id
  );
  db.prepare("DELETE FROM categories WHERE id = ?").run(id);
  syncCategoryCounts(db);

  return res.json({ success: true });
});

export default router;
