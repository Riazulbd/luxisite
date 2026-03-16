import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../../../hooks/useApi";
import { useTheme } from "../../../hooks/useTheme";
import { useViewport } from "../../../hooks/useViewport";
import { buttonStyle, inputStyle, panelStyle } from "../ui";

export default function CategoryManager() {
  const theme = useTheme();
  const { isMobile, isTablet } = useViewport();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState({ name: "", description: "", color: "#C8742A" });
  const query = useQuery({
    queryKey: ["categories-manager"],
    queryFn: () => apiFetch("/api/categories")
  });

  const createMutation = useMutation({
    mutationFn: (payload) =>
      apiFetch("/api/categories", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: () => {
      setDraft({ name: "", description: "", color: "#C8742A" });
      queryClient.invalidateQueries({ queryKey: ["categories-manager"] });
    }
  });

  const saveMutation = useMutation({
    mutationFn: ({ id, ...payload }) =>
      apiFetch(`/api/categories/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories-manager"] })
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiFetch(`/api/categories/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories-manager"] })
  });

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div>
        <h1 style={{ margin: 0, fontFamily: "Outfit, sans-serif", color: theme.text }}>Categories</h1>
        <p style={{ margin: "8px 0 0", color: theme.text3, fontFamily: "Manrope, sans-serif" }}>
          Organize blog posts into clear thematic buckets and keep archive pages tidy.
        </p>
      </div>
      <section style={{ ...panelStyle(theme, { padding: 20, display: "grid", gap: 12 }) }}>
        <h2 style={{ margin: 0, fontFamily: "Outfit, sans-serif", color: theme.text }}>Add category</h2>
        <div style={{ display: "grid", gridTemplateColumns: isMobile || isTablet ? "minmax(0, 1fr)" : "1.2fr 1fr 140px auto", gap: 12 }}>
          <input value={draft.name} onChange={(event) => setDraft((value) => ({ ...value, name: event.target.value }))} placeholder="Category name" style={inputStyle(theme)} />
          <input value={draft.description} onChange={(event) => setDraft((value) => ({ ...value, description: event.target.value }))} placeholder="Description" style={inputStyle(theme)} />
          <input type="color" value={draft.color} onChange={(event) => setDraft((value) => ({ ...value, color: event.target.value }))} style={{ ...inputStyle(theme), padding: 8, height: 48 }} />
          <button type="button" onClick={() => createMutation.mutate(draft)} style={buttonStyle(theme, "primary")}>
            {createMutation.isPending ? "Adding..." : "Add Category"}
          </button>
        </div>
      </section>
      <div style={{ display: "grid", gap: 16 }}>
        {(query.data?.categories || []).map((category) => (
          <CategoryRow key={category.id} category={category} theme={theme} saveMutation={saveMutation} deleteMutation={deleteMutation} stacked={isMobile || isTablet} />
        ))}
      </div>
    </div>
  );
}

function CategoryRow({ category, theme, saveMutation, deleteMutation, stacked }) {
  const [draft, setDraft] = useState(category);
  return (
    <div style={{ ...panelStyle(theme, { padding: 18, display: "grid", gridTemplateColumns: stacked ? "minmax(0, 1fr)" : "1.1fr 1.3fr 120px 90px auto auto", gap: 12, alignItems: "center" }) }}>
      <input value={draft.name} onChange={(event) => setDraft((value) => ({ ...value, name: event.target.value }))} style={inputStyle(theme)} />
      <input value={draft.description || ""} onChange={(event) => setDraft((value) => ({ ...value, description: event.target.value }))} style={inputStyle(theme)} />
      <input type="color" value={draft.color || "#C8742A"} onChange={(event) => setDraft((value) => ({ ...value, color: event.target.value }))} style={{ ...inputStyle(theme), padding: 6, height: 48 }} />
      <div style={{ color: theme.text3, fontFamily: "IBM Plex Mono, monospace", textAlign: stacked ? "left" : "center" }}>{category.post_count}</div>
      <button type="button" onClick={() => saveMutation.mutate(draft)} style={buttonStyle(theme, "default")}>Save</button>
      <button type="button" onClick={() => deleteMutation.mutate(category.id)} style={buttonStyle(theme, "danger")}>Delete</button>
    </div>
  );
}

