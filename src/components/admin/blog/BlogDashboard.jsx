import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Link } from "react-router-dom";
import { apiFetch } from "../../../hooks/useApi";
import { useTheme } from "../../../hooks/useTheme";
import { useViewport } from "../../../hooks/useViewport";
import { buttonStyle, panelStyle } from "../ui";

function StatCard({ label, value, theme }) {
  return (
    <div style={{ ...panelStyle(theme, { padding: 24 }) }}>
      <div style={{ color: theme.text3, fontFamily: "Manrope, sans-serif", marginBottom: 8 }}>{label}</div>
      <div style={{ color: theme.text, fontFamily: "Fraunces, serif", fontSize: "2rem" }}>{value}</div>
    </div>
  );
}

export default function BlogDashboard() {
  const theme = useTheme();
  const { isMobile, isTablet } = useViewport();
  const postsQuery = useQuery({
    queryKey: ["dashboard-posts"],
    queryFn: () => apiFetch("/api/posts/admin?limit=100")
  });

  const posts = postsQuery.data?.posts || [];
  const stats = useMemo(() => ({
    total: posts.length,
    published: posts.filter((post) => post.status === "published").length,
    drafts: posts.filter((post) => post.status === "draft").length,
    scheduled: posts.filter((post) => post.status === "scheduled").length
  }), [posts]);

  const seoDistribution = useMemo(() => [
    { label: "0-40", count: posts.filter((post) => post.seo_score <= 40).length },
    { label: "41-70", count: posts.filter((post) => post.seo_score > 40 && post.seo_score <= 70).length },
    { label: "71-85", count: posts.filter((post) => post.seo_score > 70 && post.seo_score <= 85).length },
    { label: "86-100", count: posts.filter((post) => post.seo_score > 85).length }
  ], [posts]);

  const topPosts = [...posts].sort((a, b) => (b.view_count || 0) - (a.view_count || 0)).slice(0, 5);
  const drafts = posts.filter((post) => post.status === "draft").slice(0, 5);

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: "Product Sans, sans-serif", color: theme.text }}>Blog dashboard</h1>
          <p style={{ margin: "8px 0 0", color: theme.text3, fontFamily: "Manrope, sans-serif" }}>
            A quick pulse on content production, SEO quality, and publishing momentum.
          </p>
        </div>
        <Link to="/admin/posts/new" style={{ ...buttonStyle(theme, "primary"), textDecoration: "none" }}>
          New Post
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
        <StatCard label="Total Posts" value={stats.total} theme={theme} />
        <StatCard label="Published" value={stats.published} theme={theme} />
        <StatCard label="Drafts" value={stats.drafts} theme={theme} />
        <StatCard label="Scheduled" value={stats.scheduled} theme={theme} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile || isTablet ? "minmax(0, 1fr)" : "minmax(0, 1.4fr) minmax(320px, 0.9fr)", gap: 20 }}>
        <section style={{ ...panelStyle(theme, { padding: 24, minHeight: 340 }) }}>
          <h2 style={{ margin: "0 0 18px", fontFamily: "Product Sans, sans-serif", color: theme.text }}>SEO score distribution</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={seoDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.cardBorder} />
              <XAxis dataKey="label" stroke={theme.text3} />
              <YAxis stroke={theme.text3} />
              <Tooltip />
              <Bar dataKey="count" fill={theme.accent} radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
        <section style={{ display: "grid", gap: 20 }}>
          <div style={{ ...panelStyle(theme, { padding: 24 }) }}>
            <h2 style={{ margin: "0 0 14px", fontFamily: "Product Sans, sans-serif", color: theme.text }}>Recent drafts</h2>
            <div style={{ display: "grid", gap: 12 }}>
              {drafts.length ? drafts.map((post) => (
                <Link key={post.id} to={`/admin/posts/${post.id}/edit`} style={{ textDecoration: "none", color: theme.text }}>
                  {post.title}
                </Link>
              )) : <div style={{ color: theme.text3, fontFamily: "Manrope, sans-serif" }}>No drafts are waiting right now.</div>}
            </div>
          </div>
          <div style={{ ...panelStyle(theme, { padding: 24 }) }}>
            <h2 style={{ margin: "0 0 14px", fontFamily: "Product Sans, sans-serif", color: theme.text }}>Top posts by views</h2>
            <div style={{ display: "grid", gap: 12 }}>
              {topPosts.length ? topPosts.map((post) => (
                <div key={post.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontFamily: "Manrope, sans-serif", color: theme.text2 }}>
                  <Link to={`/admin/posts/${post.id}/edit`} style={{ textDecoration: "none", color: theme.text }}>
                    {post.title}
                  </Link>
                  <span>{post.view_count || 0}</span>
                </div>
              )) : <div style={{ color: theme.text3, fontFamily: "Manrope, sans-serif" }}>Published posts will surface here once they start collecting views.</div>}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
