import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { apiFetch } from "../../hooks/useApi";
import { clay, useTheme } from "../../hooks/useTheme";
import { useViewport } from "../../hooks/useViewport";

function SidebarCard({ children, theme, title, compact }) {
  return (
    <section
      style={{
        background: theme.card,
        border: `1px solid ${theme.cardBorder}`,
        borderRadius: 22,
        padding: compact ? 18 : 22,
        boxShadow: clay(1)
      }}
    >
      <h3
        style={{
          margin: "0 0 16px",
          fontFamily: "Outfit, sans-serif",
          fontSize: "1.05rem",
          color: theme.text
        }}
      >
        {title}
      </h3>
      {children}
    </section>
  );
}

export default function BlogSidebar() {
  const theme = useTheme();
  const { isMobile } = useViewport();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const categoriesQuery = useQuery({
    queryKey: ["blog-categories"],
    queryFn: () => apiFetch("/api/categories")
  });
  const tagsQuery = useQuery({
    queryKey: ["blog-tags"],
    queryFn: () => apiFetch("/api/tags")
  });
  const recentPostsQuery = useQuery({
    queryKey: ["recent-posts"],
    queryFn: () => apiFetch("/api/posts?limit=5")
  });

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <SidebarCard theme={theme} title="Search" compact={isMobile}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            navigate(`/blog/search?q=${encodeURIComponent(query)}`);
          }}
        >
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search articles"
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: 16,
              border: `1px solid ${theme.cardBorder}`,
              background: theme.surface2,
              fontFamily: "Manrope, sans-serif",
              color: theme.text
            }}
          />
        </form>
      </SidebarCard>

      <SidebarCard theme={theme} title="Categories" compact={isMobile}>
        <div style={{ display: "grid", gap: 10 }}>
          {(categoriesQuery.data?.categories || []).map((category) => (
            <Link
              key={category.id}
              to={`/blog/category/${category.slug}`}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                textDecoration: "none",
                color: theme.text2,
                fontFamily: "Manrope, sans-serif"
              }}
            >
              <span>{category.name}</span>
              <span style={{ color: theme.text3 }}>{category.post_count}</span>
            </Link>
          ))}
        </div>
      </SidebarCard>

      <SidebarCard theme={theme} title="Recent Posts" compact={isMobile}>
        <div style={{ display: "grid", gap: 14 }}>
          {(recentPostsQuery.data?.posts || []).map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              style={{ textDecoration: "none", color: theme.text }}
            >
              <div
                style={{
                  fontFamily: "Outfit, sans-serif",
                  fontSize: "0.95rem",
                  marginBottom: 4
                }}
              >
                {post.title}
              </div>
              <div
                style={{
                  fontFamily: "Manrope, sans-serif",
                  color: theme.text3,
                  fontSize: "0.82rem"
                }}
              >
                {format(new Date(post.published_at || post.created_at), "MMM dd, yyyy")}
              </div>
            </Link>
          ))}
        </div>
      </SidebarCard>

      <SidebarCard theme={theme} title="Tags" compact={isMobile}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(tagsQuery.data?.tags || []).map((tag) => (
            <Link
              key={tag.id}
              to={`/blog/tag/${tag.slug}`}
              style={{
                textDecoration: "none",
                padding: `${8 + Math.min(tag.post_count || 0, 4)}px 12px`,
                borderRadius: 999,
                background: theme.tagBg,
                color: theme.tagC,
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: tag.post_count > 4 ? "0.86rem" : "0.75rem"
              }}
            >
              {tag.name}
            </Link>
          ))}
        </div>
      </SidebarCard>

      <SidebarCard theme={theme} title="Stay Updated" compact={isMobile}>
        <p
          style={{
            margin: "0 0 12px",
            color: theme.text3,
            lineHeight: 1.7,
            fontFamily: "Manrope, sans-serif"
          }}
        >
          Get updates on CRM architecture, AI automation, and revenue operations.
        </p>
        <div
          style={{
            padding: "14px 16px",
            borderRadius: 16,
            background: theme.surface2,
            color: theme.text2,
            fontFamily: "Manrope, sans-serif"
          }}
        >
          Newsletter capture is ready to connect to your preferred email platform.
        </div>
      </SidebarCard>
    </div>
  );
}

