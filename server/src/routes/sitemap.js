import express from "express";

const router = express.Router();

router.get("/sitemap.xml", (req, res) => {
  const db = req.app.locals.db;
  const siteUrl = (process.env.SITE_URL || "https://automationpaths.com").replace(/\/$/, "");
  const posts = db
    .prepare(
      `
        SELECT slug, updated_at
        FROM posts
        WHERE status = 'published'
        ORDER BY COALESCE(published_at, created_at) DESC
      `
    )
    .all();
  const categories = db
    .prepare(
      `
        SELECT c.slug AS slug, MAX(p.updated_at) AS updated_at
        FROM categories c
        JOIN posts p ON p.category_id = c.id
        WHERE p.status = 'published'
        GROUP BY c.id
      `
    )
    .all();

  const urls = [
    {
      loc: `${siteUrl}/`,
      changefreq: "weekly",
      priority: "1.0",
      lastmod: new Date().toISOString()
    },
    {
      loc: `${siteUrl}/blog`,
      changefreq: "daily",
      priority: "0.8",
      lastmod: posts[0]?.updated_at || new Date().toISOString()
    },
    ...posts.map((post) => ({
      loc: `${siteUrl}/blog/${post.slug}`,
      changefreq: "monthly",
      priority: "0.7",
      lastmod: post.updated_at
    })),
    ...categories.map((category) => ({
      loc: `${siteUrl}/blog/category/${category.slug}`,
      changefreq: "weekly",
      priority: "0.5",
      lastmod: category.updated_at
    }))
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(
      (url) => `  <url>\n    <loc>${url.loc}</loc>\n    <lastmod>${url.lastmod}</lastmod>\n    <changefreq>${url.changefreq}</changefreq>\n    <priority>${url.priority}</priority>\n  </url>`
    )
    .join("\n")}\n</urlset>`;

  res.type("application/xml").send(xml);
});

export default router;
