import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { apiFetch, buildQuery } from "../../../hooks/useApi";
import { useTheme } from "../../../hooks/useTheme";
import { useViewport } from "../../../hooks/useViewport";
import { buttonStyle, inputStyle, panelStyle, statusBadgeStyle } from "../ui";

export default function PostList() {
  const theme = useTheme();
  const { isMobile, isTablet } = useViewport();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [category, setCategory] = useState("");

  const postsQuery = useQuery({
    queryKey: ["admin-posts", status, search],
    queryFn: () => apiFetch(`/api/posts/admin${buildQuery({ status, search, limit: 100 })}`)
  });
  const categoriesQuery = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => apiFetch("/api/categories")
  });

  const filteredPosts = useMemo(() => {
    const posts = postsQuery.data?.posts || [];
    return category ? posts.filter((post) => post.category?.slug === category) : posts;
  }, [category, postsQuery.data?.posts]);

  const trashMutation = useMutation({
    mutationFn: async (ids) =>
      Promise.all(ids.map((id) => apiFetch(`/api/posts/${id}`, { method: "DELETE" }))),
    onSuccess: () => {
      setSelected([]);
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
    }
  });

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: "Product Sans, sans-serif", color: theme.text }}>Posts</h1>
          <p style={{ margin: "8px 0 0", color: theme.text3, fontFamily: "Manrope, sans-serif" }}>
            Review drafts, published posts, SEO scores, and scheduled pieces.
          </p>
        </div>
        <Link to="/admin/posts/new" style={{ ...buttonStyle(theme, "primary"), textDecoration: "none" }}>
          New Post
        </Link>
      </div>

      <div style={{ ...panelStyle(theme, { padding: 20, display: "grid", gap: 16 }) }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {["all", "published", "draft", "scheduled", "trash"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatus(tab)}
              style={buttonStyle(theme, status === tab ? "primary" : "default")}
            >
              {tab === "all" ? "All" : tab[0].toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile || isTablet ? "minmax(0, 1fr)" : "minmax(220px, 1fr) 220px auto", gap: 12 }}>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search posts"
            style={inputStyle(theme)}
          />
          <select value={category} onChange={(event) => setCategory(event.target.value)} style={inputStyle(theme)}>
            <option value="">All categories</option>
            {(categoriesQuery.data?.categories || []).map((item) => (
              <option key={item.id} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!selected.length || trashMutation.isPending}
            onClick={() => trashMutation.mutate(selected)}
            style={buttonStyle(theme, "danger")}
          >
            {trashMutation.isPending ? "Moving..." : "Move to Trash"}
          </button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Manrope, sans-serif" }}>
            <thead>
              <tr style={{ textAlign: "left", color: theme.text3 }}>
                <th style={{ padding: "12px 8px" }}>
                  <input
                    type="checkbox"
                    checked={selected.length > 0 && selected.length === filteredPosts.length}
                    onChange={(event) =>
                      setSelected(event.target.checked ? filteredPosts.map((post) => post.id) : [])
                    }
                  />
                </th>
                <th style={{ padding: "12px 8px" }}>Title</th>
                <th style={{ padding: "12px 8px" }}>Category</th>
                <th style={{ padding: "12px 8px" }}>Tags</th>
                <th style={{ padding: "12px 8px" }}>Status</th>
                <th style={{ padding: "12px 8px" }}>SEO</th>
                <th style={{ padding: "12px 8px" }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((post) => (
                <tr key={post.id} style={{ borderTop: `1px solid ${theme.cardBorder}`, color: theme.text2 }}>
                  <td style={{ padding: "14px 8px" }}>
                    <input
                      type="checkbox"
                      checked={selected.includes(post.id)}
                      onChange={(event) =>
                        setSelected((current) =>
                          event.target.checked
                            ? [...current, post.id]
                            : current.filter((id) => id !== post.id)
                        )
                      }
                    />
                  </td>
                  <td style={{ padding: "14px 8px" }}>
                    <Link to={`/admin/posts/${post.id}/edit`} style={{ color: theme.text, textDecoration: "none", fontWeight: 600 }}>
                      {post.title}
                    </Link>
                  </td>
                  <td style={{ padding: "14px 8px" }}>{post.category?.name || "Uncategorized"}</td>
                  <td style={{ padding: "14px 8px" }}>{(post.tags || []).map((tag) => tag.name).join(", ") || "—"}</td>
                  <td style={{ padding: "14px 8px" }}>
                    <span style={statusBadgeStyle(theme, post.status)}>{post.status}</span>
                  </td>
                  <td style={{ padding: "14px 8px" }}>{post.seo_score || 0}</td>
                  <td style={{ padding: "14px 8px" }}>{new Date(post.updated_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
