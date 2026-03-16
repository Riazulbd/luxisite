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

function Pagination({ pagination, setPage, theme }) {
  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 24 }}>
      <button
        type="button"
        onClick={() => setPage(pagination.page - 1)}
        disabled={!pagination.hasPrev}
        style={{
          border: 0,
          borderRadius: 999,
          padding: "12px 18px",
          background: theme.surface2,
          color: theme.text,
          cursor: pagination.hasPrev ? "pointer" : "not-allowed"
        }}
      >
        ← Previous
      </button>
      {Array.from({ length: pagination.totalPages }, (_, index) => index + 1)
        .slice(Math.max(0, pagination.page - 3), pagination.page + 2)
        .map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            onClick={() => setPage(pageNumber)}
            style={{
              border: 0,
              borderRadius: 999,
              padding: "12px 16px",
              background: pageNumber === pagination.page ? theme.grad : theme.surface2,
              color: pageNumber === pagination.page ? "#fff" : theme.text,
              cursor: "pointer"
            }}
          >
            {pageNumber}
          </button>
        ))}
      <button
        type="button"
        onClick={() => setPage(pagination.page + 1)}
        disabled={!pagination.hasNext}
        style={{
          border: 0,
          borderRadius: 999,
          padding: "12px 18px",
          background: theme.surface2,
          color: theme.text,
          cursor: pagination.hasNext ? "pointer" : "not-allowed"
        }}
      >
        Next →
      </button>
    </div>
  );
}

export default function BlogArchive() {
  const theme = useTheme();
  const { isMobile, isTablet } = useViewport();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") || 1);
  const search = searchParams.get("search") || "";

  const postsQuery = useQuery({
    queryKey: ["blog-posts", page, search],
    queryFn: () =>
      apiFetch(
        `/api/posts${buildQuery({
          page,
          limit: 10,
          search
        })}`
      )
  });

  return (
    <div style={{ background: theme.bg, minHeight: "100vh", padding: isMobile ? "24px 14px 56px" : "48px 20px 72px" }}>
      <SeoHead
        title="Blog | Automation Paths"
        description="Insights on GoHighLevel, AI automation, VAPI voice agents, and revenue system architecture for agencies and growth-stage businesses."
        canonical="https://automationpaths.com/blog"
        og={{
          title: "Blog | Automation Paths",
          description:
            "Insights on GoHighLevel, AI automation, VAPI voice agents, and revenue system architecture for agencies and growth-stage businesses.",
          url: "https://automationpaths.com/blog"
        }}
      />
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>
        <PublicBlogHeader />
        <div
          style={{
            background: theme.surface,
            border: `1px solid ${theme.cardBorder}`,
            borderRadius: 30,
            padding: isMobile ? "22px 18px" : "30px 28px",
            boxShadow: clay(1.2),
            marginBottom: 28
          }}
        >
          <p
            style={{
              margin: "0 0 10px",
              fontFamily: "IBM Plex Mono, monospace",
              color: theme.tagC,
              fontSize: "0.82rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase"
            }}
          >
            Automation Paths Blog
          </p>
          <h1
            style={{
              margin: 0,
              fontFamily: "Outfit, sans-serif",
              fontSize: "clamp(2.2rem, 4vw, 3.6rem)",
              color: theme.text
            }}
          >
            Revenue systems insights for operators shipping real automation.
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
            {(postsQuery.data?.posts || []).map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
            {!postsQuery.isLoading && !(postsQuery.data?.posts || []).length ? (
              <div
                style={{
                  background: theme.card,
                  borderRadius: 24,
                  border: `1px solid ${theme.cardBorder}`,
                  padding: 26,
                  boxShadow: clay(1),
                  color: theme.text2,
                  fontFamily: "Manrope, sans-serif"
                }}
              >
                No published posts match this view yet.
              </div>
            ) : null}
            <Pagination
              pagination={postsQuery.data?.pagination}
              theme={theme}
              setPage={(nextPage) => {
                const next = new URLSearchParams(searchParams);
                next.set("page", String(nextPage));
                setSearchParams(next);
              }}
            />
          </div>
          <BlogSidebar />
        </div>
      </div>
    </div>
  );
}

