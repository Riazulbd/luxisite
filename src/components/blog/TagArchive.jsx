import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "react-router-dom";
import { apiFetch, buildQuery } from "../../hooks/useApi";
import { clay, useTheme } from "../../hooks/useTheme";
import { useViewport } from "../../hooks/useViewport";
import BlogCard from "./BlogCard";
import BlogSidebar from "./BlogSidebar";
import SeoHead from "./SeoHead";

export default function TagArchive() {
  const theme = useTheme();
  const { isMobile, isTablet } = useViewport();
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") || 1);
  const query = useQuery({
    queryKey: ["tag-archive", slug, page],
    queryFn: () => apiFetch(`/api/tags/${slug}${buildQuery({ page, limit: 10 })}`)
  });
  const tag = query.data?.tag;

  return (
    <div style={{ background: theme.bg, minHeight: "100vh", padding: isMobile ? "24px 14px 56px" : "48px 20px 72px" }}>
      <SeoHead
        title={`Posts tagged "${tag?.name || slug}" | Automation Paths Blog`}
        description={`Browse articles tagged ${tag?.name || slug} on the Automation Paths blog.`}
        canonical={`https://automationpaths.com/blog/tag/${slug}`}
      />
      <div style={{ maxWidth: 1240, margin: "0 auto", display: "grid", gap: 28 }}>
        <div
          style={{
            background: theme.card,
            border: `1px solid ${theme.cardBorder}`,
            borderRadius: 28,
            padding: isMobile ? "22px 18px" : "28px 26px",
            boxShadow: clay(1)
          }}
        >
          <h1 style={{ margin: 0, fontFamily: "Product Sans, sans-serif", color: theme.text }}>
            Tag: {tag?.name || slug}
          </h1>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isTablet || isMobile ? "minmax(0, 1fr)" : "minmax(0, 2.1fr) minmax(280px, 0.9fr)",
            gap: isMobile ? 20 : 28
          }}
        >
          <div style={{ display: "grid", gap: 20 }}>
            {(query.data?.posts || []).map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
            {query.data?.pagination?.totalPages > 1 ? (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  type="button"
                  disabled={!query.data.pagination.hasPrev}
                  onClick={() => {
                    const next = new URLSearchParams(searchParams);
                    next.set("page", String(page - 1));
                    setSearchParams(next);
                  }}
                  style={{ padding: "12px 16px", borderRadius: 999, border: 0, background: theme.surface2, cursor: "pointer" }}
                >
                  ← Previous
                </button>
                <button
                  type="button"
                  disabled={!query.data.pagination.hasNext}
                  onClick={() => {
                    const next = new URLSearchParams(searchParams);
                    next.set("page", String(page + 1));
                    setSearchParams(next);
                  }}
                  style={{ padding: "12px 16px", borderRadius: 999, border: 0, background: theme.surface2, cursor: "pointer" }}
                >
                  Next →
                </button>
              </div>
            ) : null}
          </div>
          <BlogSidebar />
        </div>
      </div>
    </div>
  );
}
