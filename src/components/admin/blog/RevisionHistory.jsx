import React from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { apiFetch } from "../../../hooks/useApi";
import { useTheme } from "../../../hooks/useTheme";
import { buttonStyle } from "../ui";

export default function RevisionHistory({ postId, onRestore }) {
  const theme = useTheme();
  const query = useQuery({
    queryKey: ["post-revisions", postId],
    queryFn: () => apiFetch(`/api/posts/${postId}/revisions`),
    enabled: Boolean(postId)
  });

  if (!postId) {
    return (
      <div style={{ color: theme.text3, fontFamily: "Manrope, sans-serif" }}>
        Save the post once to start revision history.
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {(query.data?.revisions || []).slice(0, 10).map((revision) => (
        <div key={revision.id} style={{ border: `1px solid ${theme.cardBorder}`, borderRadius: 16, padding: 12, display: "grid", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "Product Sans, sans-serif", color: theme.text }}>
                {format(new Date(revision.created_at), "MMM dd, yyyy HH:mm")}
              </div>
              <div style={{ color: theme.text3, fontFamily: "IBM Plex Mono, monospace", fontSize: "0.78rem" }}>
                {revision.revision_type}
              </div>
            </div>
            <button type="button" onClick={() => onRestore(revision.id)} style={buttonStyle(theme, "default", { padding: "10px 14px" })}>
              Restore
            </button>
          </div>
          {revision.revision_note ? (
            <div style={{ color: theme.text2, fontFamily: "Manrope, sans-serif", fontSize: "0.92rem" }}>
              {revision.revision_note}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
