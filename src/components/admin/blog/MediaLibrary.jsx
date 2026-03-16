import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../../../hooks/useApi";
import { useTheme } from "../../../hooks/useTheme";
import { useViewport } from "../../../hooks/useViewport";
import { buttonStyle, panelStyle } from "../ui";

export default function MediaLibrary({ selectionMode = false, onSelect, onClose }) {
  const theme = useTheme();
  const { isMobile } = useViewport();
  const queryClient = useQueryClient();
  const mediaQuery = useQuery({
    queryKey: ["media-library"],
    queryFn: () => apiFetch("/api/media?limit=100")
  });

  const uploadMutation = useMutation({
    mutationFn: async (files) => {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      const token = window.localStorage.getItem("ap_admin_token") || "";
      const response = await fetch("/api/media/upload", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
        body: formData
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Upload failed");
      }
      return payload;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["media-library"] })
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiFetch(`/api/media/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["media-library"] })
  });

  const onDrop = useCallback((files) => uploadMutation.mutate(files), [uploadMutation]);
  const dropzone = useDropzone({ onDrop, accept: { "image/*": [] } });

  const content = (
    <div style={{ display: "grid", gap: 16 }}>
      <div
        {...dropzone.getRootProps()}
        style={{
          ...panelStyle(theme, {
            padding: 22,
            background: theme.surface2,
            borderStyle: "dashed",
            cursor: "pointer",
            textAlign: "center"
          })
        }}
      >
        <input {...dropzone.getInputProps()} />
        <div style={{ fontFamily: "Product Sans, sans-serif", color: theme.text }}>Drag images here or click to upload</div>
        <div style={{ marginTop: 8, color: theme.text3, fontFamily: "Manrope, sans-serif" }}>
          JPEG, PNG, GIF, and WebP are converted to optimized WebP assets.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? 140 : 180}px, 1fr))`, gap: 16 }}>
        {(mediaQuery.data?.media || []).map((item) => (
          <div key={item.id} style={{ ...panelStyle(theme, { padding: 14, display: "grid", gap: 12 }) }}>
            <img src={item.thumbnail_url || item.url} alt={item.alt_text || item.original_name} style={{ width: "100%", aspectRatio: "4 / 3", objectFit: "cover", borderRadius: 16 }} />
            <div>
              <div style={{ fontFamily: "Product Sans, sans-serif", color: theme.text, fontSize: "0.95rem" }}>{item.original_name}</div>
              <div style={{ color: theme.text3, fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem" }}>
                {item.width || "?"}×{item.height || "?"} • {Math.round((item.file_size || 0) / 1024)}KB
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {selectionMode ? (
                <button type="button" onClick={() => onSelect?.(item)} style={buttonStyle(theme, "primary", { flex: 1 })}>
                  Select
                </button>
              ) : null}
              <button type="button" onClick={() => deleteMutation.mutate(item.id)} style={buttonStyle(theme, "danger", { flex: 1 })}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (!selectionMode && !onClose) {
    return content;
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.46)", padding: isMobile ? 10 : 24, zIndex: 1000, overflow: "auto" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", ...panelStyle(theme, { padding: isMobile ? 14 : 20 }) }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: isMobile ? "flex-start" : "center", flexDirection: isMobile ? "column" : "row", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontFamily: "Product Sans, sans-serif", color: theme.text }}>Media library</h2>
          <button type="button" onClick={onClose} style={buttonStyle(theme, "ghost")}>Close</button>
        </div>
        {content}
      </div>
    </div>
  );
}
