import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "react-router-dom";
import { apiFetch, buildQuery } from "../../hooks/useApi";
import { clay, useTheme } from "../../hooks/useTheme";
import { useViewport } from "../../hooks/useViewport";
import BlogCard from "./BlogCard";
import PublicBlogHeader from "./PublicBlogHeader";
import BlogSidebar from "./BlogSidebar";
import SeoHead from "./SeoHead";

export default function CategoryArchive() {
  const theme = useTheme();
  const { isMobile, isTablet } = useViewport();
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") || 1);
  const query = useQuery({
    queryKey: ["category-archive", slug, page],
    queryFn: () => apiFetch(`/api/categories/${slug}${buildQuery({ page, limit: 10 })}`)
  });

  const category = query.data?.category;

  return (
    <div style={{ background: theme.bg, minHeight: "100vh", padding: isMobile ? "24px 14px 56px" : "48px 20px 72px" }}>
      <SeoHead
        title={`${category?.meta_title || category?.name || "Category"} | Automation Paths Blog`}
        description={category?.meta_description || category?.description || "Category archive for the Automation Paths blog."}
        canonical={`https://automationpaths.com/blog/category/${slug}`}
      />
      <div style={{ maxWidth: 1240, margin: "0 auto", display: "grid", gap: 28 }}>
        <PublicBlogHeader />
        <div
          style={{
            background: theme.card,
            border: `1px solid ${theme.cardBorder}`,
            borderRadius: 28,
            padding: isMobile ? "22px 18px" : "28px 26px",
            boxShadow: clay(1)
          }}
        >
          <h1 style={{ margin: "0 0 10px", fontFamily: "Outfit, sans-serif", color: theme.text }}>
            {category?.name || "Category"}
          </h1>
          <p style={{ margin: 0, color: theme.text3, fontFamily: "Manrope, sans-serif", lineHeight: 1.7 }}>
            {category?.description || "Posts grouped by category."}
          </p>
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

