import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { apiFetch } from "../../../hooks/useApi";
import { useTheme } from "../../../hooks/useTheme";
import { useViewport } from "../../../hooks/useViewport";
import { panelStyle } from "../ui";

export default function BlogAnalytics() {
  const theme = useTheme();
  const { isMobile, isTablet } = useViewport();
  const postsQuery = useQuery({
    queryKey: ["analytics-posts"],
    queryFn: () => apiFetch("/api/posts/admin?limit=100")
  });

  const posts = postsQuery.data?.posts || [];
  const topPosts = [...posts].sort((a, b) => (b.view_count || 0) - (a.view_count || 0)).slice(0, 10);
  const seoTrend = useMemo(
    () =>
      posts
        .slice()
        .sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at))
        .slice(-12)
        .map((post) => ({
          name: post.title.slice(0, 18),
          seo: post.seo_score || 0
        })),
    [posts]
  );

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div>
        <h1 style={{ margin: 0, fontFamily: "Outfit, sans-serif", color: theme.text }}>Blog analytics</h1>
        <p style={{ margin: "8px 0 0", color: theme.text3, fontFamily: "Manrope, sans-serif" }}>
          Performance signals pulled from publishing history and view counts.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile || isTablet ? "minmax(0, 1fr)" : "minmax(0, 1.2fr) minmax(0, 1fr)", gap: 20 }}>
        <section style={{ ...panelStyle(theme, { padding: 24, minHeight: 340 }) }}>
          <h2 style={{ margin: "0 0 18px", fontFamily: "Outfit, sans-serif", color: theme.text }}>SEO score trend</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={seoTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.cardBorder} />
              <XAxis dataKey="name" stroke={theme.text3} />
              <YAxis stroke={theme.text3} />
              <Tooltip />
              <Line type="monotone" dataKey="seo" stroke={theme.accent} strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </section>
        <section style={{ ...panelStyle(theme, { padding: 24, minHeight: 340 }) }}>
          <h2 style={{ margin: "0 0 18px", fontFamily: "Outfit, sans-serif", color: theme.text }}>Top posts by views</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topPosts.map((post) => ({ name: post.title.slice(0, 14), views: post.view_count || 0 }))}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.cardBorder} />
              <XAxis dataKey="name" stroke={theme.text3} />
              <YAxis stroke={theme.text3} />
              <Tooltip />
              <Bar dataKey="views" fill={theme.accentDark} radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>
    </div>
  );
}

