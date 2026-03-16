import React from "react";
import { useTheme } from "../../../hooks/useTheme";
import { useViewport } from "../../../hooks/useViewport";
import { buttonStyle, inputStyle, panelStyle } from "../ui";
import AiSeoTools from "./AiSeoTools";
import SeoChecklist from "./SeoChecklist";
import SeoScoreCircle from "./SeoScoreCircle";

export default function SeoPanel({
  post,
  analysis,
  loadingKey,
  onAnalyze,
  onGenerateSchema,
  onImprove,
  onGenerateMeta,
  onSuggestKeywords,
  onFixIssues,
  onFieldChange
}) {
  const theme = useTheme();
  const { isMobile } = useViewport();
  const serpTitle = (post.meta_title || post.title || "Untitled").slice(0, 60);
  const serpDescription = (post.meta_description || post.excerpt || "").slice(0, 160);

  return (
    <div style={{ ...panelStyle(theme, { padding: 18, display: "grid", gap: 16, minWidth: 0 }) }}>
      <div style={{ display: "grid", justifyItems: "center", gap: 12 }}>
        <SeoScoreCircle score={analysis?.overallScore || post.seo_score || 0} />
        <input
          value={post.focus_keyword || ""}
          onChange={(event) => onFieldChange("focus_keyword", event.target.value)}
          placeholder="Focus keyword"
          style={inputStyle(theme)}
        />
        <button
          type="button"
          onClick={onAnalyze}
          disabled={Boolean(loadingKey)}
          style={buttonStyle(theme, "primary")}
        >
          {loadingKey === "analyze" ? "Analyzing SEO..." : "Analyze SEO"}
        </button>
      </div>

      <AiSeoTools
        loadingKey={loadingKey}
        onImprove={onImprove}
        onGenerateMeta={onGenerateMeta}
        onSuggestKeywords={onSuggestKeywords}
        onFixIssues={onFixIssues}
      />

      {analysis?.checks?.length ? <SeoChecklist checks={analysis.checks} /> : null}

      <div style={{ display: "grid", gap: 10, minWidth: 0 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span
            style={{
              color: theme.text2,
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "0.76rem"
            }}
          >
            Meta title ({(post.meta_title || "").length}/60)
          </span>
          <input
            value={post.meta_title || ""}
            onChange={(event) => onFieldChange("meta_title", event.target.value)}
            style={inputStyle(theme)}
          />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span
            style={{
              color: theme.text2,
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "0.76rem"
            }}
          >
            Meta description ({(post.meta_description || "").length}/160)
          </span>
          <textarea
            value={post.meta_description || ""}
            onChange={(event) => onFieldChange("meta_description", event.target.value)}
            rows={4}
            style={inputStyle(theme, { resize: "vertical" })}
          />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span
            style={{
              color: theme.text2,
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "0.76rem"
            }}
          >
            Schema type
          </span>
          <select
            value={post.schema_type || "BlogPosting"}
            onChange={(event) => onFieldChange("schema_type", event.target.value)}
            style={inputStyle(theme)}
          >
            {["BlogPosting", "Article", "HowTo", "FAQPage", "TechArticle"].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={onGenerateSchema}
          disabled={Boolean(loadingKey)}
          style={buttonStyle(theme, "default")}
        >
          {loadingKey === "schema" ? "Generating schema..." : "Generate Schema"}
        </button>
        <details>
          <summary
            style={{
              cursor: "pointer",
              color: theme.text,
              fontFamily: "Outfit, sans-serif"
            }}
          >
            Social Preview
          </summary>
          <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
            <input
              value={post.og_title || ""}
              onChange={(event) => onFieldChange("og_title", event.target.value)}
              placeholder="OG title"
              style={inputStyle(theme)}
            />
            <textarea
              value={post.og_description || ""}
              onChange={(event) => onFieldChange("og_description", event.target.value)}
              placeholder="OG description"
              rows={3}
              style={inputStyle(theme, { resize: "vertical" })}
            />
            <input
              value={post.og_image || ""}
              onChange={(event) => onFieldChange("og_image", event.target.value)}
              placeholder="OG image URL"
              style={inputStyle(theme)}
            />
          </div>
        </details>
        <div style={{ ...panelStyle(theme, { padding: isMobile ? 14 : 16, background: theme.surface2, minWidth: 0 }) }}>
          <div
            style={{
              color: "#0f62fe",
              fontSize: "0.9rem",
              fontFamily: "Outfit, sans-serif",
              overflowWrap: "anywhere"
            }}
          >
            {serpTitle || "Untitled post"}
          </div>
          <div
            style={{
              color: "#188038",
              fontSize: "0.82rem",
              fontFamily: "Manrope, sans-serif",
              marginTop: 4,
              overflowWrap: "anywhere"
            }}
          >
            automationpaths.com &gt; blog &gt; {post.slug || "post-slug"}
          </div>
          <div
            style={{
              color: theme.text3,
              fontSize: "0.9rem",
              fontFamily: "Manrope, sans-serif",
              marginTop: 6,
              lineHeight: 1.6,
              overflowWrap: "anywhere"
            }}
          >
            {serpDescription || "Your meta description preview will appear here."}
          </div>
        </div>
      </div>
    </div>
  );
}

