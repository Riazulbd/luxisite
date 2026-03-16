import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../../../hooks/useApi";
import { useTheme } from "../../../hooks/useTheme";
import { useViewport } from "../../../hooks/useViewport";
import { buttonStyle, inputStyle, panelStyle } from "../ui";

export default function TagManager() {
  const theme = useTheme();
  const { isMobile, isTablet } = useViewport();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const query = useQuery({
    queryKey: ["tags-manager"],
    queryFn: () => apiFetch("/api/tags")
  });

  const createMutation = useMutation({
    mutationFn: (payload) =>
      apiFetch("/api/tags", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: () => {
      setName("");
      queryClient.invalidateQueries({ queryKey: ["tags-manager"] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...payload }) =>
      apiFetch(`/api/tags/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tags-manager"] })
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiFetch(`/api/tags/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tags-manager"] })
  });

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div>
        <h1 style={{ margin: 0, fontFamily: "Product Sans, sans-serif", color: theme.text }}>Tags</h1>
        <p style={{ margin: "8px 0 0", color: theme.text3, fontFamily: "Manrope, sans-serif" }}>
          Keep tags clean so autocomplete and tag archives stay useful.
        </p>
      </div>
      <section style={{ ...panelStyle(theme, { padding: 20, display: "grid", gap: 12 }) }}>
        <h2 style={{ margin: 0, fontFamily: "Product Sans, sans-serif", color: theme.text }}>Add tag</h2>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "minmax(0, 1fr)" : "1fr auto", gap: 12 }}>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Tag name" style={inputStyle(theme)} />
          <button type="button" onClick={() => createMutation.mutate({ name })} style={buttonStyle(theme, "primary")}>
            {createMutation.isPending ? "Adding..." : "Add Tag"}
          </button>
        </div>
      </section>
      <div style={{ display: "grid", gap: 16 }}>
        {(query.data?.tags || []).map((tag) => (
          <TagRow key={tag.id} tag={tag} theme={theme} updateMutation={updateMutation} deleteMutation={deleteMutation} stacked={isMobile || isTablet} />
        ))}
      </div>
    </div>
  );
}

function TagRow({ tag, theme, updateMutation, deleteMutation, stacked }) {
  const [draft, setDraft] = useState(tag);
  return (
    <div style={{ ...panelStyle(theme, { padding: 18, display: "grid", gridTemplateColumns: stacked ? "minmax(0, 1fr)" : "1fr 120px auto auto", gap: 12, alignItems: "center" }) }}>
      <input value={draft.name} onChange={(event) => setDraft((value) => ({ ...value, name: event.target.value }))} style={inputStyle(theme)} />
      <div style={{ color: theme.text3, fontFamily: "IBM Plex Mono, monospace", textAlign: stacked ? "left" : "center" }}>{tag.post_count}</div>
      <button type="button" onClick={() => updateMutation.mutate(draft)} style={buttonStyle(theme, "default")}>Save</button>
      <button type="button" onClick={() => deleteMutation.mutate(tag.id)} style={buttonStyle(theme, "danger")}>Delete</button>
    </div>
  );
}
