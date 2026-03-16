import fs from "fs";
import path from "path";
import {
  escapeHtml,
  getPostBySlug,
  getSiteUrl,
  serializeForInlineScript,
  toAbsoluteUrl
} from "../utils/blog.js";

let cachedIndexHtml = "";
const DEFAULT_OG_IMAGE = `${getSiteUrl()}/og-default.svg`;

function readTemplate(frontendDistPath) {
  if (!frontendDistPath) {
    cachedIndexHtml = "";
    return cachedIndexHtml;
  }

  cachedIndexHtml = fs.readFileSync(path.join(frontendDistPath, "index.html"), "utf8");
  return cachedIndexHtml;
}

function stripManagedHeadTags(html) {
  return html
    .replace(/<title>[\s\S]*?<\/title>\s*/i, "")
    .replace(/<meta name="description"[^>]*>\s*/gi, "")
    .replace(/<meta name="keywords"[^>]*>\s*/gi, "")
    .replace(/<link rel="canonical"[^>]*>\s*/gi, "")
    .replace(/<meta property="og:[^"]+"[^>]*>\s*/gi, "")
    .replace(/<meta name="twitter:[^"]+"[^>]*>\s*/gi, "")
    .replace(/<script id="ap-ssr-schema" type="application\/ld\+json">[\s\S]*?<\/script>\s*/gi, "");
}

function injectHead(html, tags) {
  return html.replace("</head>", `    ${tags.join("\n    ")}\n  </head>`);
}

function injectPreloadedPost(html, post) {
  const stripped = html.replace(
    /<script id="ap-preloaded-post">[\s\S]*?<\/script>\s*/i,
    ""
  );

  if (!post) {
    return stripped;
  }

  const payload = serializeForInlineScript(post);
  const preloadScript = `<script id="ap-preloaded-post">window.__PRELOADED_POST__ = ${payload};</script>`;

  if (stripped.includes("</body>")) {
    return stripped.replace("</body>", `  ${preloadScript}\n  </body>`);
  }

  return `${stripped}\n${preloadScript}`;
}

function buildBaseTags(meta) {
  const tags = [
    `<title>${escapeHtml(meta.title)}</title>`
  ];

  if (meta.description) {
    tags.push(`<meta name="description" content="${escapeHtml(meta.description)}" />`);
  }

  if (meta.keywords) {
    tags.push(`<meta name="keywords" content="${escapeHtml(meta.keywords)}" />`);
  }

  if (meta.canonical) {
    tags.push(`<link rel="canonical" href="${escapeHtml(meta.canonical)}" />`);
  }

  tags.push(`<meta property="og:type" content="${escapeHtml(meta.ogType || "website")}" />`);

  if (meta.ogTitle) {
    tags.push(`<meta property="og:title" content="${escapeHtml(meta.ogTitle)}" />`);
  }

  if (meta.ogDescription) {
    tags.push(
      `<meta property="og:description" content="${escapeHtml(meta.ogDescription)}" />`
    );
  }

  if (meta.ogImage) {
    tags.push(`<meta property="og:image" content="${escapeHtml(meta.ogImage)}" />`);
  }

  if (meta.ogUrl) {
    tags.push(`<meta property="og:url" content="${escapeHtml(meta.ogUrl)}" />`);
  }

  if (meta.ogPublishedTime) {
    tags.push(
      `<meta property="article:published_time" content="${escapeHtml(meta.ogPublishedTime)}" />`
    );
  }

  if (meta.ogModifiedTime) {
    tags.push(
      `<meta property="article:modified_time" content="${escapeHtml(meta.ogModifiedTime)}" />`
    );
  }

  if (meta.ogSection) {
    tags.push(`<meta property="article:section" content="${escapeHtml(meta.ogSection)}" />`);
  }

  if (Array.isArray(meta.ogTags)) {
    meta.ogTags.filter(Boolean).forEach((tag) => {
      tags.push(`<meta property="article:tag" content="${escapeHtml(tag)}" />`);
    });
  }

  tags.push(
    `<meta name="twitter:card" content="${escapeHtml(meta.twitterCard || "summary_large_image")}" />`
  );

  if (meta.twitterTitle) {
    tags.push(`<meta name="twitter:title" content="${escapeHtml(meta.twitterTitle)}" />`);
  }

  if (meta.twitterDescription) {
    tags.push(
      `<meta name="twitter:description" content="${escapeHtml(meta.twitterDescription)}" />`
    );
  }

  if (meta.twitterImage) {
    tags.push(
      `<meta name="twitter:image" content="${escapeHtml(meta.twitterImage)}" />`
    );
  }

  if (meta.schema) {
    tags.push(
      `<script id="ap-ssr-schema" type="application/ld+json">${serializeForInlineScript(meta.schema)}</script>`
    );
  }

  return tags;
}

function buildArchiveMeta() {
  return {
    title: "Blog | Automation Paths",
    description:
      "Insights on GoHighLevel, AI automation, VAPI voice agents, and revenue system architecture for agencies and growth-stage businesses.",
    canonical: `${getSiteUrl()}/blog`,
    ogTitle: "Blog | Automation Paths",
    ogDescription:
      "Insights on GoHighLevel, AI automation, VAPI voice agents, and revenue system architecture for agencies and growth-stage businesses.",
    ogImage: DEFAULT_OG_IMAGE,
    ogUrl: `${getSiteUrl()}/blog`,
    twitterTitle: "Blog | Automation Paths",
    twitterDescription:
      "Insights on GoHighLevel, AI automation, VAPI voice agents, and revenue system architecture for agencies and growth-stage businesses.",
    twitterImage: DEFAULT_OG_IMAGE
  };
}

function buildSearchMeta(searchValue) {
  const query = searchValue?.trim();
  const label = query || "Blog";
  const description = query
    ? `Search results for ${query} on Automation Paths.`
    : "Search the Automation Paths blog for revenue systems insights.";

  return {
    title: `Search: ${label} | Automation Paths`,
    description,
    canonical: `${getSiteUrl()}/blog/search${query ? `?q=${encodeURIComponent(query)}` : ""}`,
    ogTitle: `Search: ${label} | Automation Paths`,
    ogDescription: description,
    ogImage: DEFAULT_OG_IMAGE,
    ogUrl: `${getSiteUrl()}/blog/search${query ? `?q=${encodeURIComponent(query)}` : ""}`,
    twitterTitle: `Search: ${label} | Automation Paths`,
    twitterDescription: description,
    twitterImage: DEFAULT_OG_IMAGE
  };
}

function buildCategoryMeta(category, slug) {
  const name = category?.name || "Category";
  const description =
    category?.meta_description ||
    category?.description ||
    "Category archive for the Automation Paths blog.";

  return {
    title: `${category?.meta_title || name} | Automation Paths Blog`,
    description,
    canonical: `${getSiteUrl()}/blog/category/${slug}`,
    ogTitle: `${category?.meta_title || name} | Automation Paths Blog`,
    ogDescription: description,
    ogImage: DEFAULT_OG_IMAGE,
    ogUrl: `${getSiteUrl()}/blog/category/${slug}`,
    twitterTitle: `${category?.meta_title || name} | Automation Paths Blog`,
    twitterDescription: description,
    twitterImage: DEFAULT_OG_IMAGE
  };
}

function buildTagMeta(tag, slug) {
  const name = tag?.name || slug;
  const description = `Browse articles tagged ${name} on the Automation Paths blog.`;

  return {
    title: `Posts tagged "${name}" | Automation Paths Blog`,
    description,
    canonical: `${getSiteUrl()}/blog/tag/${slug}`,
    ogTitle: `Posts tagged "${name}" | Automation Paths Blog`,
    ogDescription: description,
    ogImage: DEFAULT_OG_IMAGE,
    ogUrl: `${getSiteUrl()}/blog/tag/${slug}`,
    twitterTitle: `Posts tagged "${name}" | Automation Paths Blog`,
    twitterDescription: description,
    twitterImage: DEFAULT_OG_IMAGE
  };
}

function buildPostSchema(post) {
  if (post.schema_json) {
    try {
      return JSON.parse(post.schema_json);
    } catch {
      return null;
    }
  }

  return {
    "@context": "https://schema.org",
    "@type": post.schema_type || "BlogPosting",
    headline: post.title,
    description: post.meta_description || post.excerpt || "",
    image: post.featured_image ? toAbsoluteUrl(post.featured_image) : undefined,
    author: {
      "@type": "Person",
      name: "Riazul Islam",
      url: getSiteUrl(),
      jobTitle: "Revenue Systems Architect"
    },
    publisher: {
      "@type": "Organization",
      name: "Automation Paths",
      url: getSiteUrl(),
      logo: {
        "@type": "ImageObject",
        url: `${getSiteUrl()}/logo.png`
      }
    },
    datePublished: post.published_at,
    dateModified: post.updated_at,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${getSiteUrl()}/blog/${post.slug}`
    },
    wordCount: post.word_count,
    articleSection: post.category?.name,
    keywords: [post.focus_keyword, ...(post.secondary_keywords || [])]
      .filter(Boolean)
      .join(", ")
  };
}

function buildPostMeta(post) {
  const permalink = `${getSiteUrl()}/blog/${post.slug}`;
  const ogImage = post.og_image ? toAbsoluteUrl(post.og_image) : "";
  const featuredImage = post.featured_image ? toAbsoluteUrl(post.featured_image) : "";
  const twitterImage = post.twitter_image ? toAbsoluteUrl(post.twitter_image) : "";

  return {
    title: `${post.meta_title || post.title} | Automation Paths`,
    description: post.meta_description || post.excerpt || "",
    keywords: [post.focus_keyword, ...(post.secondary_keywords || [])]
      .filter(Boolean)
      .join(", "),
    canonical: permalink,
    ogType: "article",
    ogTitle: post.og_title || post.meta_title || post.title,
    ogDescription: post.og_description || post.meta_description || post.excerpt || "",
    ogImage: ogImage || featuredImage || DEFAULT_OG_IMAGE,
    ogUrl: permalink,
    ogPublishedTime: post.published_at,
    ogModifiedTime: post.updated_at,
    ogSection: post.category?.name || "",
    ogTags: (post.tags || []).map((tag) => tag.name),
    twitterCard: "summary_large_image",
    twitterTitle: post.twitter_title || post.og_title || post.meta_title || post.title,
    twitterDescription:
      post.twitter_description ||
      post.og_description ||
      post.meta_description ||
      post.excerpt ||
      "",
    twitterImage: twitterImage || ogImage || featuredImage || DEFAULT_OG_IMAGE,
    schema: buildPostSchema(post)
  };
}

function renderWithMeta(meta, preloadedPost = null) {
  if (!cachedIndexHtml) {
    return null;
  }

  const htmlWithoutManagedTags = stripManagedHeadTags(cachedIndexHtml);
  const headInjected = injectHead(htmlWithoutManagedTags, buildBaseTags(meta));
  return injectPreloadedPost(headInjected, preloadedPost);
}

export function initializeSpaRenderer(frontendDistPath) {
  return readTemplate(frontendDistPath);
}

export function renderBlogRouteHtml({ db, pathname, query = {} }) {
  if (!cachedIndexHtml) {
    return null;
  }

  const normalizedPath = pathname.replace(/\/+$/, "") || "/";

  if (normalizedPath === "/blog") {
    return { statusCode: 200, html: renderWithMeta(buildArchiveMeta()) };
  }

  if (normalizedPath === "/blog/search") {
    return {
      statusCode: 200,
      html: renderWithMeta(buildSearchMeta(String(query.q || "")))
    };
  }

  if (normalizedPath.startsWith("/blog/category/")) {
    const slug = normalizedPath.slice("/blog/category/".length);
    const category = db.prepare("SELECT * FROM categories WHERE slug = ?").get(slug);
    const statusCode = category ? 200 : 404;

    return {
      statusCode,
      html: renderWithMeta(buildCategoryMeta(category, slug))
    };
  }

  if (normalizedPath.startsWith("/blog/tag/")) {
    const slug = normalizedPath.slice("/blog/tag/".length);
    const tag = db.prepare("SELECT * FROM tags WHERE slug = ?").get(slug);
    const statusCode = tag ? 200 : 404;

    return {
      statusCode,
      html: renderWithMeta(buildTagMeta(tag, slug))
    };
  }

  if (normalizedPath.startsWith("/blog/")) {
    const slug = normalizedPath.slice("/blog/".length);
    const post = getPostBySlug(db, slug);
    const publishedPost = post?.status === "published" ? post : null;
    const statusCode = publishedPost ? 200 : 404;
    const meta = publishedPost
      ? buildPostMeta(publishedPost)
      : {
          title: "Article Not Found | Automation Paths",
          description: "The requested article could not be found.",
          canonical: `${getSiteUrl()}${pathname}`,
          ogTitle: "Article Not Found | Automation Paths",
          ogDescription: "The requested article could not be found.",
          ogImage: DEFAULT_OG_IMAGE,
          ogUrl: `${getSiteUrl()}${pathname}`,
          twitterTitle: "Article Not Found | Automation Paths",
          twitterDescription: "The requested article could not be found.",
          twitterImage: DEFAULT_OG_IMAGE
        };

    return {
      statusCode,
      html: renderWithMeta(meta, publishedPost)
    };
  }

  return null;
}
