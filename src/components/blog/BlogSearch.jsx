import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { apiFetch, buildQuery } from "../../hooks/useApi";
import { clay, useTheme } from "../../hooks/useTheme";
import { useViewport } from "../../hooks/useViewport";
import BlogCard from "./BlogCard";
import PublicBlogHeader from "./PublicBlogHeader";
import BlogSidebar from "./BlogSidebar";
import SeoHead from "./SeoHead";

export default function BlogSearch() {
  const theme = useTheme();
  const { isMobile, isTablet } = useViewport();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const resultsQuery = useQuery({
    queryKey: ["blog-search", query],
    queryFn: () => apiFetch(`/api/posts${buildQuery({ search: query, limit: 20 })}`)
  });

  return (
    <div style={{ background: theme.bg, minHeight: "100vh", padding: isMobile ? "24px 14px 56px" : "48px 20px 72px" }}>
      <SeoHead
        title={`Search: ${query || "Blog"} | Automation Paths`}
        description={`Search results for ${query || "Automation Paths blog"} on Automation Paths.`}
        canonical={`https://automationpaths.com/blog/search${query ? `?q=${encodeURIComponent(query)}` : ""}`}
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
            Search results
          </h1>
          <p style={{ margin: 0, color: theme.text3, fontFamily: "Manrope, sans-serif" }}>
            Query: {query || "No query provided"}
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
            {(resultsQuery.data?.posts || []).map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
            {!resultsQuery.isLoading && !(resultsQuery.data?.posts || []).length ? (
              <div
                style={{
                  background: theme.card,
                  border: `1px solid ${theme.cardBorder}`,
                  borderRadius: 24,
                  padding: 24,
                  boxShadow: clay(1),
                  color: theme.text2,
                  fontFamily: "Manrope, sans-serif"
                }}
              >
                No posts matched “{query}”.
              </div>
            ) : null}
          </div>
          <BlogSidebar />
        </div>
      </div>
    </div>
  );
}

