import React, { useMemo } from "react";
import { useTheme } from "../../../hooks/useTheme";
import { useViewport } from "../../../hooks/useViewport";
import { buttonStyle, panelStyle } from "../ui";

function diffWords(source, target) {
  const sourceWords = source.split(/\s+/);
  const targetWords = target.split(/\s+/);
  const sourceSet = new Set(sourceWords);
  const targetSet = new Set(targetWords);
  return {
    source: sourceWords.map((word) => ({ word, removed: !targetSet.has(word) })),
    target: targetWords.map((word) => ({ word, added: !sourceSet.has(word) }))
  };
}

function renderDiff(items, mode) {
  return items.map((item, index) => (
    <span
      key={`${mode}-${index}-${item.word}`}
      style={{
        background:
          mode === "source" && item.removed
            ? "rgba(239,68,68,0.14)"
            : mode === "target" && item.added
              ? "rgba(34,197,94,0.18)"
              : "transparent",
        borderRadius: 6,
        padding: "2px 4px",
        display: "inline-block",
        marginRight: 2,
        marginBottom: 2
      }}
    >
      {item.word}{" "}
    </span>
  ));
}

export default function AiDiffView({ original = "", improved = "", onApply, onDiscard }) {
  const theme = useTheme();
  const { isMobile } = useViewport();
  const diff = useMemo(() => diffWords(original, improved), [original, improved]);

  return (
    <section style={{ ...panelStyle(theme, { padding: 20, display: "grid", gap: 16 }) }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: isMobile ? "flex-start" : "center", flexDirection: isMobile ? "column" : "row" }}>
        <h3 style={{ margin: 0, fontFamily: "Outfit, sans-serif", color: theme.text }}>AI improvement diff</h3>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", width: isMobile ? "100%" : "auto" }}>
          <button type="button" onClick={onApply} style={buttonStyle(theme, "primary")}>Apply Changes</button>
          <button type="button" onClick={onDiscard} style={buttonStyle(theme, "ghost")}>Discard</button>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "minmax(0, 1fr)" : "repeat(2, minmax(0, 1fr))", gap: 16 }}>
        <div style={{ ...panelStyle(theme, { padding: 16, background: theme.surface2 }) }}>
          <div style={{ marginBottom: 10, fontFamily: "IBM Plex Mono, monospace", color: theme.text2 }}>Original</div>
          <div style={{ fontFamily: "Manrope, sans-serif", color: theme.text, lineHeight: 1.8 }}>
            {renderDiff(diff.source, "source")}
          </div>
        </div>
        <div style={{ ...panelStyle(theme, { padding: 16, background: theme.surface2 }) }}>
          <div style={{ marginBottom: 10, fontFamily: "IBM Plex Mono, monospace", color: theme.text2 }}>Improved</div>
          <div style={{ fontFamily: "Manrope, sans-serif", color: theme.text, lineHeight: 1.8 }}>
            {renderDiff(diff.target, "target")}
          </div>
        </div>
      </div>
    </section>
  );
}

