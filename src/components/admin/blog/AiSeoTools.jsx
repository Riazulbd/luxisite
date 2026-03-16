import React from "react";
import { useTheme } from "../../../hooks/useTheme";
import { useViewport } from "../../../hooks/useViewport";
import { buttonStyle } from "../ui";

export default function AiSeoTools({ loadingKey, onImprove, onGenerateMeta, onSuggestKeywords, onFixIssues }) {
  const theme = useTheme();
  const { isMobile } = useViewport();

  return (
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "minmax(0, 1fr)" : "repeat(2, minmax(0, 1fr))", gap: 10 }}>
      <button type="button" onClick={onImprove} disabled={Boolean(loadingKey)} style={buttonStyle(theme, "default")}>
        {loadingKey === "improve" ? "Improving article..." : "Improve Article"}
      </button>
      <button type="button" onClick={onGenerateMeta} disabled={Boolean(loadingKey)} style={buttonStyle(theme, "default")}>
        {loadingKey === "meta" ? "Generating metadata..." : "Generate Meta"}
      </button>
      <button type="button" onClick={onSuggestKeywords} disabled={Boolean(loadingKey)} style={buttonStyle(theme, "default")}>
        {loadingKey === "keywords" ? "Analyzing keywords..." : "Suggest Keywords"}
      </button>
      <button type="button" onClick={onFixIssues} disabled={Boolean(loadingKey)} style={buttonStyle(theme, "default")}>
        {loadingKey === "fix" ? "Fixing SEO issues..." : "Fix Issues"}
      </button>
    </div>
  );
}
