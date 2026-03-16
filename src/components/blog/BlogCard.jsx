import React from "react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { clay, useTheme } from "../../hooks/useTheme";

function buildResponsiveImage(post) {
  const media = post.featured_image_media;
  const full = media?.full;
  const medium = media?.medium;
  const thumbnail = media?.thumbnail;
  const fallbackUrl = post.featured_image || "";
  const src = medium?.url || thumbnail?.url || full?.url || fallbackUrl;
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
    sizes:
      "(max-width: 767px) calc(100vw - 48px), (max-width: 1024px) calc(100vw - 72px), 760px"
  };
}

function formatDate(value) {
  if (!value) {
    return "Unscheduled";
  }
  return format(new Date(value), "MMM dd, yyyy");
}

export default function BlogCard({ post, compact = false }) {
  const theme = useTheme();
  const image = buildResponsiveImage(post);

  return (
    <article
      style={{
        background: theme.card,
        border: `1px solid ${theme.cardBorder}`,
        borderRadius: 24,
        overflow: "hidden",
        boxShadow: clay(compact ? 0.9 : 1.15),
        transition: "transform 180ms ease, box-shadow 180ms ease"
      }}
    >
      {post.featured_image ? (
        <Link to={`/blog/${post.slug}`} style={{ display: "block", aspectRatio: "16 / 9" }}>
          <img
            src={image.src}
            srcSet={image.srcSet}
            sizes={image.sizes}
            alt={post.featured_image_alt || post.title}
            loading="lazy"
            decoding="async"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Link>
      ) : null}
      <div style={{ padding: compact ? 18 : 24 }}>
        {post.category ? (
          <Link
            to={`/blog/category/${post.category.slug}`}
            style={{
              display: "inline-flex",
              padding: "6px 12px",
              borderRadius: 999,
              background: post.category.color ? `${post.category.color}15` : theme.tagBg,
              color: post.category.color || theme.tagC,
              textDecoration: "none",
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "0.75rem",
              marginBottom: 14
            }}
          >
            {post.category.name}
          </Link>
        ) : null}
        <h2
          style={{
            margin: "0 0 12px",
            fontFamily: "Outfit, sans-serif",
            fontWeight: 700,
            fontSize: compact ? "1.15rem" : "1.45rem",
            lineHeight: 1.08
          }}
        >
          <Link
            to={`/blog/${post.slug}`}
            style={{ color: theme.text, textDecoration: "none" }}
          >
            {post.title}
          </Link>
        </h2>
        <p
          style={{
            margin: "0 0 18px",
            color: theme.text3,
            fontFamily: "Manrope, sans-serif",
            fontSize: compact ? "0.92rem" : "1rem",
            lineHeight: 1.7
          }}
        >
          {post.excerpt || "Explore how this system architecture translates into real-world automation and revenue clarity."}
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            color: theme.text3,
            fontFamily: "Manrope, sans-serif",
            fontSize: "0.86rem"
          }}
        >
          <span>{post.author?.name || "Riazul Islam"}</span>
          <span>•</span>
          <span>{formatDate(post.published_at || post.created_at)}</span>
          <span>•</span>
          <span>{post.reading_time || 1} min read</span>
        </div>
      </div>
    </article>
  );
}

