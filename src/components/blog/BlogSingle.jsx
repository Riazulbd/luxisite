import React, { Suspense, lazy, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Link, useLocation, useParams } from "react-router-dom";
import { apiFetch } from "../../hooks/useApi";
import { clay, useTheme } from "../../hooks/useTheme";
import { useViewport } from "../../hooks/useViewport";
import BlogSidebar from "./BlogSidebar";
import PublicBlogHeader from "./PublicBlogHeader";
import SchemaMarkup from "./SchemaMarkup";
import SeoHead from "./SeoHead";

const RelatedPosts = lazy(() => import("./RelatedPosts"));
const ShareButtons = lazy(() => import("./ShareButtons"));
const TableOfContents = lazy(() => import("./TableOfContents"));

function slugHeading(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function injectHeadingIds(content) {
  return String(content || "").replace(
    /<(h[23])([^>]*)>([\s\S]*?)<\/\1>/gi,
    (_match, tag, attrs, inner) => {
      const text = inner.replace(/<[^>]+>/g, "");
      const id = slugHeading(text);
      return `<${tag}${attrs} id="${id}">${inner}</${tag}>`;
    }
  );
}

function buildResponsiveImage(post) {
  const media = post?.featured_image_media;
  const full = media?.full;
  const medium = media?.medium;
  const thumbnail = media?.thumbnail;
  const fallbackUrl = post?.featured_image || "";

  const src = full?.url || medium?.url || thumbnail?.url || fallbackUrl;
  const sources = [
    thumbnail?.url && thumbnail?.width
      ? `${thumbnail.url} ${thumbnail.width}w`
      : null,
    medium?.url && medium?.width ? `${medium.url} ${medium.width}w` : null,
    full?.url && full?.width ? `${full.url} ${full.width}w` : null
  ].filter(Boolean);

  return {
    src,
    srcSet: sources.length ? sources.join(", ") : undefined,
    sizes: "(max-width: 767px) calc(100vw - 32px), 760px",
    width: full?.width || medium?.width || thumbnail?.width || 1200,
    height: full?.height || medium?.height || thumbnail?.height || 675
  };
}

export default function BlogSingle() {
  const theme = useTheme();
  const { isMobile, isTablet } = useViewport();
  const { slug } = useParams();
  const location = useLocation();
  const preview = new URLSearchParams(location.search).get("preview");
  const preloadedPost = useMemo(() => {
    if (typeof window === "undefined" || preview) {
      return null;
    }

    const payload = window.__PRELOADED_POST__;
    return payload?.slug === slug ? payload : null;
  }, [preview, slug]);
  const postQuery = useQuery({
    queryKey: ["blog-post", slug, preview],
    queryFn: () => apiFetch(`/api/posts/${slug}${preview ? "?preview=true" : ""}`),
    initialData: preloadedPost ? { post: preloadedPost } : undefined,
    enabled: !preloadedPost
  });

  const post = postQuery.data?.post;
  const contentWithAnchors = useMemo(
    () => injectHeadingIds(post?.content || ""),
    [post?.content]
  );
  const featuredImage = useMemo(() => buildResponsiveImage(post), [post]);

  useEffect(() => {
    if (!/<(?:pre|code)\b/i.test(contentWithAnchors)) {
      return undefined;
    }

    let active = true;

    (async () => {
      const [{ default: hljs }] = await Promise.all([
        import("highlight.js"),
        import("highlight.js/styles/github-dark.css")
      ]);

      if (!active) {
        return;
      }

      document.querySelectorAll(".blog-content pre code").forEach((block) => {
        hljs.highlightElement(block);
      });
    })();

    return () => {
      active = false;
    };
  }, [contentWithAnchors]);

  const schema = useMemo(() => {
    if (!post) {
      return null;
    }

    if (post.schema_json) {
      try {
        return JSON.parse(post.schema_json);
      } catch (error) {
        return null;
      }
    }

    return {
      "@context": "https://schema.org",
      "@type": post.schema_type || "BlogPosting",
      headline: post.title,
      description: post.meta_description || post.excerpt || "",
      image: post.featured_image
        ? `https://automationpaths.com${post.featured_image}`
        : undefined,
      author: {
        "@type": "Person",
        name: "Riazul Islam",
        url: "https://automationpaths.com",
        jobTitle: "Revenue Systems Architect"
      },
      publisher: {
        "@type": "Organization",
        name: "Automation Paths",
        url: "https://automationpaths.com",
        logo: {
          "@type": "ImageObject",
          url: "https://automationpaths.com/logo.png"
        }
      },
      datePublished: post.published_at,
      dateModified: post.updated_at,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `https://automationpaths.com/blog/${post.slug}`
      },
      wordCount: post.word_count,
      articleSection: post.category?.name,
      keywords: [post.focus_keyword, ...(post.secondary_keywords || [])]
        .filter(Boolean)
        .join(", ")
    };
  }, [post]);

  if (postQuery.isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        Loading article...
      </div>
    );
  }

  if (!post) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          fontFamily: "Manrope, sans-serif"
        }}
      >
        This article could not be found.
      </div>
    );
  }

  const permalink = `https://automationpaths.com/blog/${post.slug}`;

  return (
    <div
      style={{
        background: theme.bg,
        minHeight: "100vh",
        padding: isMobile ? "24px 14px 56px" : "48px 20px 72px"
      }}
    >
      <SeoHead
        title={`${post.meta_title || post.title} | Automation Paths`}
        description={post.meta_description || post.excerpt}
        canonical={permalink}
        keywords={[post.focus_keyword, ...(post.secondary_keywords || [])]}
        og={{
          type: "article",
          title: post.og_title || post.meta_title || post.title,
          description:
            post.og_description || post.meta_description || post.excerpt,
          image: post.og_image || post.featured_image,
          url: permalink,
          publishedTime: post.published_at,
          modifiedTime: post.updated_at,
          section: post.category?.name,
          tags: (post.tags || []).map((tag) => tag.name)
        }}
        twitter={{
          card: "summary_large_image",
          title:
            post.twitter_title || post.og_title || post.meta_title || post.title,
          description:
            post.twitter_description ||
            post.og_description ||
            post.meta_description ||
            post.excerpt,
          image: post.twitter_image || post.og_image || post.featured_image
        }}
      />
      <SchemaMarkup schema={schema} />
      <PublicBlogHeader />
      <div
        style={{
          maxWidth: 1340,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns:
            isTablet || isMobile
              ? "minmax(0, 1fr)"
              : "minmax(0, 760px) minmax(260px, 320px)",
          gap: isMobile ? 20 : 32,
          alignItems: "start"
        }}
      >
        <div
          style={{
            background: theme.card,
            border: `1px solid ${theme.cardBorder}`,
            borderRadius: 30,
            padding: isMobile ? "22px 16px" : "32px 28px",
            boxShadow: clay(1.15),
            minWidth: 0
          }}
        >
          {post.category ? (
            <Link
              to={`/blog/category/${post.category.slug}`}
              style={{
                display: "inline-flex",
                padding: "6px 12px",
                borderRadius: 999,
                background: theme.tagBg,
                color: theme.tagC,
                textDecoration: "none",
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "0.76rem",
                marginBottom: 18
              }}
            >
              {post.category.name}
            </Link>
          ) : null}
          <h1
            style={{
              margin: "0 0 16px",
              fontFamily: "Outfit, sans-serif",
              fontSize: isMobile
                ? "clamp(1.7rem, 9vw, 2.4rem)"
                : "clamp(2rem, 4vw, 3.2rem)",
              color: theme.text,
              lineHeight: 1.05
            }}
          >
            {post.title}
          </h1>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              color: theme.text3,
              fontFamily: "Manrope, sans-serif",
              fontSize: isMobile ? "0.84rem" : "0.92rem",
              marginBottom: 24
            }}
          >
            <span>{post.author?.name || "Riazul Islam"}</span>
            <span>|</span>
            <span>{format(new Date(post.published_at || post.created_at), "MMM dd, yyyy")}</span>
            <span>|</span>
            <span>{post.reading_time || 1} min read</span>
            <span>|</span>
            <span>{post.view_count || 0} views</span>
          </div>
          {post.featured_image ? (
            <figure style={{ margin: "0 0 28px" }}>
              <img
                src={featuredImage.src}
                srcSet={featuredImage.srcSet}
                sizes={featuredImage.sizes}
                alt={post.featured_image_alt || post.title}
                width={featuredImage.width}
                height={featuredImage.height}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                style={{
                  width: "100%",
                  height: "auto",
                  borderRadius: 24,
                  display: "block"
                }}
              />
              {post.featured_image_caption ? (
                <figcaption
                  style={{
                    marginTop: 10,
                    color: theme.text3,
                    fontFamily: "Manrope, sans-serif",
                    fontSize: "0.9rem"
                  }}
                >
                  {post.featured_image_caption}
                </figcaption>
              ) : null}
            </figure>
          ) : null}
          <div
            className="blog-content"
            style={{
              color: theme.text2,
              ["--blog-accent"]: theme.accentDark,
              overflowWrap: "anywhere"
            }}
            dangerouslySetInnerHTML={{ __html: contentWithAnchors }}
          />
          {isMobile ? (
            <div style={{ marginTop: 22 }}>
              <Suspense fallback={null}>
                <TableOfContents content={contentWithAnchors} />
              </Suspense>
            </div>
          ) : null}
          {(post.tags || []).length ? (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 28 }}>
              {post.tags.map((tag) => (
                <Link
                  key={tag.id}
                  to={`/blog/tag/${tag.slug}`}
                  style={{
                    textDecoration: "none",
                    padding: "8px 12px",
                    borderRadius: 999,
                    background: theme.tagBg,
                    color: theme.tagC,
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "0.76rem"
                  }}
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          ) : null}
          <div style={{ marginTop: 28 }}>
            <Suspense fallback={null}>
              <ShareButtons url={permalink} title={post.title} />
            </Suspense>
          </div>
          <section
            style={{
              marginTop: 32,
              padding: isMobile ? 18 : 24,
              borderRadius: 24,
              background: theme.surface2,
              border: `1px solid ${theme.cardBorder}`
            }}
          >
            <h3
              style={{
                margin: "0 0 10px",
                fontFamily: "Outfit, sans-serif",
                color: theme.text
              }}
            >
              About the author
            </h3>
            <p
              style={{
                margin: 0,
                fontFamily: "Manrope, sans-serif",
                color: theme.text3,
                lineHeight: 1.8
              }}
            >
              Riazul Islam is the Revenue Systems Architect behind Automation Paths,
              helping agencies and operators turn fragmented CRM and AI tooling into
              clearer revenue infrastructure.
            </p>
          </section>
          <Suspense fallback={null}>
            <RelatedPosts postId={post.id} />
          </Suspense>
        </div>
        <div style={{ display: "grid", gap: 18, alignSelf: "start", minWidth: 0 }}>
          {!isMobile ? (
            <Suspense fallback={null}>
              <TableOfContents content={contentWithAnchors} />
            </Suspense>
          ) : null}
          <BlogSidebar />
        </div>
      </div>
    </div>
  );
}

