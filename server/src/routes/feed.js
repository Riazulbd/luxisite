import express from "express";
import { Feed } from "feed";

const router = express.Router();

function buildFeed(req) {
  const db = req.app.locals.db;
  const siteUrl = (process.env.SITE_URL || "https://automationpaths.com").replace(/\/$/, "");
  const feed = new Feed({
    title: "Automation Paths Blog",
    description:
      "Insights on revenue systems architecture, CRM design, AI automation, GoHighLevel, VAPI, and operational growth.",
    id: `${siteUrl}/blog`,
    link: `${siteUrl}/blog`,
    language: "en",
    copyright: `All rights reserved ${new Date().getFullYear()}, Automation Paths`,
    updated: new Date(),
    feedLinks: {
      rss2: `${siteUrl}/feed.xml`,
      atom: `${siteUrl}/feed/atom.xml`
    },
    author: {
      name: "Riazul Islam",
      email: process.env.ADMIN_EMAIL || "hello@automationpaths.com",
      link: siteUrl
    }
  });

  const posts = db
    .prepare(
      `
        SELECT p.*, c.name AS category_name
        FROM posts p
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE p.status = 'published'
        ORDER BY COALESCE(p.published_at, p.created_at) DESC
        LIMIT 20
      `
    )
    .all();

  for (const post of posts) {
    feed.addItem({
      title: post.title,
      id: `${siteUrl}/blog/${post.slug}`,
      link: `${siteUrl}/blog/${post.slug}`,
      description: post.excerpt || "",
      content: post.content,
      author: [
        {
          name: "Riazul Islam",
          email: process.env.ADMIN_EMAIL || "hello@automationpaths.com",
          link: siteUrl
        }
      ],
      date: new Date(post.published_at || post.created_at),
      category: post.category_name ? [{ name: post.category_name }] : []
    });
  }

  return feed;
}

router.get("/feed.xml", (req, res) => {
  res.type("application/xml").send(buildFeed(req).rss2());
});

router.get("/feed/atom.xml", (req, res) => {
  res.type("application/atom+xml").send(buildFeed(req).atom1());
});

export default router;
