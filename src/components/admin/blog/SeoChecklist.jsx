import React, { useState } from "react";
import { useTheme } from "../../../hooks/useTheme";

const STATUS_ICON = {
  pass: "✅",
  warning: "⚠️",
  fail: "❌"
};

export default function SeoChecklist({ checks = [] }) {
  const theme = useTheme();
  const [expandedId, setExpandedId] = useState("");

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {checks.map((check) => (
        <div key={check.id} style={{ border: `1px solid ${theme.cardBorder}`, borderRadius: 16, overflow: "hidden" }}>
          <button
            type="button"
            onClick={() => setExpandedId((current) => (current === check.id ? "" : check.id))}
            style={{
              width: "100%",
              border: 0,
              background: "transparent",
              display: "flex",
              gap: 10,
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 14px",
              cursor: "pointer",
              color: theme.text,
              fontFamily: "Manrope, sans-serif"
            }}
          >
            <span style={{ display: "flex", gap: 10, alignItems: "center", textAlign: "left" }}>
              <span>{STATUS_ICON[check.status] || "•"}</span>
              <span>{check.name}</span>
            </span>
            <span style={{ color: theme.text3, fontFamily: "IBM Plex Mono, monospace" }}>{check.score}</span>
          </button>
          {expandedId === check.id ? (
            <div style={{ padding: "0 14px 14px", color: theme.text3, fontFamily: "Manrope, sans-serif", lineHeight: 1.7 }}>
              <div>{check.message}</div>
              {check.fix ? <div style={{ marginTop: 8, color: theme.text2 }}>Fix: {check.fix}</div> : null}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
