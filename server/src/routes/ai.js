import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { callOpenRouter } from "../services/openrouter.js";
import { analyzeSeo } from "../services/seoAnalyzer.js";
import { prepareContentMetrics, safeJsonParse } from "../utils/blog.js";

const router = express.Router();

function parseJsonResponse(value) {
  const cleaned = String(value || "")
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "");
  return JSON.parse(cleaned);
}

function getPost(db, postId) {
  return db.prepare("SELECT * FROM posts WHERE id = ?").get(Number(postId));
}

function updatePostFields(db, postId, fields) {
  const entries = Object.entries(fields).filter(([, value]) => value !== undefined);
  if (!entries.length) {
    return;
  }

  const now = new Date().toISOString();
  const assignments = entries.map(([key]) => `${key} = ?`).join(", ");
  db.prepare(
    `UPDATE posts SET ${assignments}, updated_at = ? WHERE id = ?`
  ).run(...entries.map(([, value]) => value), now, postId);
}

router.use(requireAuth);

router.post("/improve-seo", async (req, res) => {
  try {
    const db = req.app.locals.db;
    let { postId, content, focusKeyword, issues = [] } = req.body || {};

    if (postId) {
      const post = getPost(db, postId);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      content = content || post.content;
      focusKeyword = focusKeyword || post.focus_keyword;
      if (!issues.length) {
        const metrics = prepareContentMetrics(content);
        const analysis = analyzeSeo({
          title: post.title,
          content,
          contentRaw: metrics.contentRaw,
          slug: post.slug,
          focusKeyword,
          secondaryKeywords: post.secondary_keywords,
          metaTitle: post.meta_title,
          metaDescription: post.meta_description,
          featuredImage: post.featured_image,
          featuredImageAlt: post.featured_image_alt,
          schemaJson: post.schema_json,
          canonicalUrl: post.canonical_url,
          ogTitle: post.og_title,
          ogDescription: post.og_description,
          twitterTitle: post.twitter_title,
          twitterDescription: post.twitter_description,
          excerpt: post.excerpt
        });
        issues = analysis.checks
          .filter((check) => check.status !== "pass")
          .map((check) => `${check.name}: ${check.fix || check.message}`);
      }
    }

    const improvedContent = await callOpenRouter(
      "You are an expert SEO content optimizer. Rewrite the given blog article to fix the listed SEO issues. Naturally incorporate the focus keyword at 1-2% density. Add keyword to first paragraph if missing. Improve heading structure. Break long paragraphs (max 3-4 sentences). Shorten long sentences (avg 15-18 words). Add transition words. Maintain author voice. Keep facts accurate. Return ONLY the improved HTML (p, h2, h3, strong, em, a, ul, ol, li, blockquote, code, pre, img tags). No explanation, no markdown fences, no preamble.",
      `Focus keyword: ${focusKeyword || "Not set"}\n\nSEO issues:\n${issues.length ? issues.join("\n") : "Improve overall SEO quality."}\n\nCurrent article HTML:\n${content || ""}`
    );

    if (postId) {
      updatePostFields(db, postId, {
        ai_improved_content: improvedContent,
        ai_seo_suggestions: JSON.stringify(issues)
      });
    }

    return res.json({ content: improvedContent });
  } catch (error) {
    return res.status(500).json({ error: error.message || "AI improvement failed" });
  }
});

router.post("/generate-meta", async (req, res) => {
  try {
    const db = req.app.locals.db;
    let { postId, title, content, focusKeyword } = req.body || {};
    if (postId) {
      const post = getPost(db, postId);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      title = title || post.title;
      content = content || post.content;
      focusKeyword = focusKeyword || post.focus_keyword;
    }

    const result = parseJsonResponse(
      await callOpenRouter(
        "Generate SEO metadata for this blog article. Return ONLY valid JSON: {\"meta_title\":\"...(max 60 chars, keyword near start)\",\"meta_description\":\"...(120-155 chars, keyword included, compelling)\",\"og_title\":\"...(social-optimized)\",\"og_description\":\"...(100-200 chars)\",\"slug\":\"...(3-5 words, keyword included, kebab-case)\",\"excerpt\":\"...(1-2 sentences, max 160 chars)\"} No markdown, no explanation, no code fences. Pure JSON only.",
        `Focus keyword: ${focusKeyword || "Not set"}\nArticle title: ${title || ""}\nArticle content (first 500 words): ${prepareContentMetrics(content || "").contentRaw.split(/\s+/).slice(0, 500).join(" ")}`
      )
    );

    if (postId) {
      updatePostFields(db, postId, result);
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message || "AI metadata generation failed" });
  }
});

router.post("/suggest-keywords", async (req, res) => {
  try {
    const db = req.app.locals.db;
    let { postId, title, content } = req.body || {};
    if (postId) {
      const post = getPost(db, postId);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      title = title || post.title;
      content = content || post.content;
    }

    const result = parseJsonResponse(
      await callOpenRouter(
        "Analyze this article and suggest SEO keywords. Return ONLY valid JSON: {\"primary_keyword\":\"...\",\"secondary_keywords\":[\"...\",\"...\",\"...\"],\"long_tail_keywords\":[\"...\",\"...\",\"...\"],\"lsi_keywords\":[\"...\",\"...\",\"...\",\"...\",\"...\"],\"keyword_difficulty_estimate\":\"low|medium|high\",\"content_gap_suggestions\":[\"...\",\"...\"]} Target audience: Agency owners, coaches, consultants, growth-stage businesses. Topics: revenue automation, CRM systems, AI business tools, GoHighLevel, VAPI, n8n. No markdown, no explanation, no code fences. Pure JSON only.",
        `Article title: ${title || ""}\nArticle content: ${prepareContentMetrics(content || "").contentRaw}`
      )
    );

    if (postId) {
      updatePostFields(db, postId, {
        focus_keyword: result.primary_keyword,
        secondary_keywords: JSON.stringify(result.secondary_keywords || []),
        ai_keywords: JSON.stringify(result)
      });
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message || "Keyword suggestion failed" });
  }
});

router.post("/generate-excerpt", async (req, res) => {
  try {
    const db = req.app.locals.db;
    let { postId, content } = req.body || {};
    if (postId) {
      const post = getPost(db, postId);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      content = content || post.content;
    }

    const excerpt = await callOpenRouter(
      "Create a concise blog excerpt. Return plain text only, 1-2 sentences, max 160 characters.",
      prepareContentMetrics(content || "").contentRaw
    );

    if (postId) {
      updatePostFields(db, postId, { excerpt: excerpt.trim(), ai_summary: excerpt.trim() });
    }

    return res.json({ excerpt: excerpt.trim() });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Excerpt generation failed" });
  }
});

router.post("/generate-schema", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const {
      postId,
      title,
      content,
      schemaType,
      publishedAt,
      updatedAt,
      slug,
      featuredImage,
      categoryName,
      focusKeyword
    } = req.body || {};

    let payload = {
      title,
      content,
      schemaType,
      publishedAt,
      updatedAt,
      slug,
      featuredImage,
      categoryName,
      focusKeyword
    };

    if (postId) {
      const post = getPost(db, postId);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      payload = {
        title: payload.title || post.title,
        content: payload.content || post.content,
        schemaType: payload.schemaType || post.schema_type,
        publishedAt: payload.publishedAt || post.published_at,
        updatedAt: payload.updatedAt || post.updated_at,
        slug: payload.slug || post.slug,
        featuredImage: payload.featuredImage || post.featured_image,
        categoryName: payload.categoryName || "",
        focusKeyword: payload.focusKeyword || post.focus_keyword
      };
    }

    const schemaJson = await callOpenRouter(
      "Generate JSON-LD structured data for this blog post. Use the provided schema_type. Include @context, @type, headline, description, image, author (Riazul Islam, Revenue Systems Architect, https://automationpaths.com), publisher (Automation Paths), datePublished, dateModified, mainEntityOfPage, wordCount, articleSection, keywords. For HowTo type, extract steps from content. For FAQPage, extract Q&A pairs. Return ONLY the JSON-LD object. No markdown fences.",
      `schema_type: ${payload.schemaType || "BlogPosting"}\ntitle: ${payload.title || ""}\nslug: ${payload.slug || ""}\npublishedAt: ${payload.publishedAt || ""}\nupdatedAt: ${payload.updatedAt || ""}\nfeaturedImage: ${payload.featuredImage || ""}\ncategory: ${payload.categoryName || ""}\nfocusKeyword: ${payload.focusKeyword || ""}\ncontent: ${payload.content || ""}`
    );

    if (postId) {
      updatePostFields(db, postId, { schema_json: schemaJson });
    }

    return res.json({ schema_json: schemaJson });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Schema generation failed" });
  }
});

router.post("/fix-issues", async (req, res) => {
  try {
    const db = req.app.locals.db;
    let { postId, content, focusKeyword, issues = [] } = req.body || {};
    if (postId) {
      const post = getPost(db, postId);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      content = content || post.content;
      focusKeyword = focusKeyword || post.focus_keyword;
      if (!issues.length) {
        issues = safeJsonParse(post.ai_seo_suggestions, []);
      }
    }

    const result = parseJsonResponse(
      await callOpenRouter(
        "Fix ONLY the specific SEO issues listed below in this blog article. Do not rewrite the entire article — make the minimum changes needed to fix each issue. Return ONLY a JSON object with targeted fixes: {\"fixes\":[{\"issue_id\":\"...\",\"fixed_content\":\"...(replacement HTML or text)\",\"description\":\"...\"}]} No markdown fences, no explanation outside the JSON.",
        `Focus keyword: ${focusKeyword || "Not set"}\nIssues:\n${issues.map((issue) => (typeof issue === "string" ? issue : JSON.stringify(issue))).join("\n")}\n\nArticle:\n${content || ""}`
      )
    );

    if (postId) {
      updatePostFields(db, postId, { ai_seo_suggestions: JSON.stringify(result) });
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message || "Issue fixing failed" });
  }
});

export default router;
