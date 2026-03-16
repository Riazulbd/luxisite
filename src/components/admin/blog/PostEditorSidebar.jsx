import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../../hooks/useApi";
import { useTheme } from "../../../hooks/useTheme";
import { useViewport } from "../../../hooks/useViewport";
import { buttonStyle, inputStyle, panelStyle, statusBadgeStyle } from "../ui";
import FeaturedImagePicker from "./FeaturedImagePicker";
import RevisionHistory from "./RevisionHistory";
import SchedulePublish from "./SchedulePublish";
import SeoPanel from "./SeoPanel";

function TagInput({ tags, onChange }) {
  const theme = useTheme();
  const [value, setValue] = useState("");
  const suggestionsQuery = useQuery({
    queryKey: ["tag-suggestions", value],
    queryFn: () => apiFetch(`/api/tags/search?q=${encodeURIComponent(value)}`),
    enabled: value.trim().length > 1
  });

  const available = useMemo(
    () => (suggestionsQuery.data?.tags || []).filter((tag) => !(tags || []).some((item) => item.slug === tag.slug)),
    [suggestionsQuery.data?.tags, tags]
  );

  const addTag = (tag) => {
    if (!tag) return;
    onChange([...(tags || []), tag]);
    setValue("");
  };

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {(tags || []).map((tag) => (
          <button
            key={tag.slug || tag.name}
            type="button"
            onClick={() => onChange((tags || []).filter((item) => (item.slug || item.name) !== (tag.slug || tag.name)))}
            style={{
              border: 0,
              borderRadius: 999,
              padding: "8px 12px",
              background: theme.tagBg,
              color: theme.tagC,
              fontFamily: "IBM Plex Mono, monospace",
              cursor: "pointer"
            }}
          >
            {tag.name} ×
          </button>
        ))}
      </div>
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if ((event.key === "Enter" || event.key === ",") && value.trim()) {
            event.preventDefault();
            addTag({ name: value.trim(), slug: value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") });
          }
        }}
        placeholder="Add tags"
        style={inputStyle(theme)}
      />
      {available.length ? (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {available.map((tag) => (
            <button key={tag.id} type="button" onClick={() => addTag(tag)} style={buttonStyle(theme, "default", { padding: "8px 12px" })}>
              {tag.name}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function PostEditorSidebar({
  post,
  categories,
  analysis,
  loadingKey,
  onFieldChange,
  onCreateCategory,
  onSaveDraft,
  onPublish,
  onMoveToTrash,
  onSchedule,
  onAnalyze,
  onGenerateSchema,
  onImprove,
  onGenerateMeta,
  onSuggestKeywords,
  onFixIssues,
  onRestoreRevision,
  postId,
  previewUrl
}) {
  const theme = useTheme();
  const { isMobile } = useViewport();
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [showSchedule, setShowSchedule] = useState(false);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ ...panelStyle(theme, { padding: 18, display: "grid", gap: 12 }) }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: isMobile ? "flex-start" : "center", flexDirection: isMobile ? "column" : "row" }}>
          <span style={statusBadgeStyle(theme, post.status)}>{post.status || "draft"}</span>
          {postId ? <a href={previewUrl} target="_blank" rel="noreferrer" style={{ color: theme.accentDark, fontFamily: "IBM Plex Mono, monospace", fontSize: "0.78rem" }}>Preview</a> : null}
        </div>
        <button type="button" onClick={onSaveDraft} disabled={Boolean(loadingKey)} style={buttonStyle(theme, "default")}>
          {loadingKey === "save" ? "Saving draft..." : "Save Draft"}
        </button>
        <button type="button" onClick={onPublish} disabled={Boolean(loadingKey)} style={buttonStyle(theme, "primary")}>
          {loadingKey === "publish" ? "Publishing..." : "Publish"}
        </button>
        <button type="button" onClick={() => setShowSchedule((value) => !value)} style={buttonStyle(theme, "ghost")}>
          Schedule
        </button>
        {showSchedule ? (
          <SchedulePublish
            initialValue={post.scheduled_at}
            onSchedule={(value) => {
              onSchedule(value);
              setShowSchedule(false);
            }}
            onClose={() => setShowSchedule(false)}
          />
        ) : null}
        {postId ? (
          <button type="button" onClick={onMoveToTrash} style={buttonStyle(theme, "danger")}>
            Move to Trash
          </button>
        ) : null}
      </div>

      <div style={{ ...panelStyle(theme, { padding: 18, display: "grid", gap: 12 }) }}>
        <div style={{ fontFamily: "Outfit, sans-serif", color: theme.text }}>Category</div>
        <select value={post.category_id || ""} onChange={(event) => onFieldChange("category_id", Number(event.target.value) || "")} style={inputStyle(theme)}>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {showCategoryForm ? (
          <div style={{ display: "grid", gap: 10 }}>
            <input value={newCategory.name} onChange={(event) => setNewCategory((value) => ({ ...value, name: event.target.value }))} placeholder="Category name" style={inputStyle(theme)} />
            <input value={newCategory.description} onChange={(event) => setNewCategory((value) => ({ ...value, description: event.target.value }))} placeholder="Description" style={inputStyle(theme)} />
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={async () => {
                  const created = await onCreateCategory(newCategory);
                  if (created) {
                    onFieldChange("category_id", created.id);
                    setNewCategory({ name: "", description: "" });
                    setShowCategoryForm(false);
                  }
                }}
                style={buttonStyle(theme, "primary")}
              >
                Add Category
              </button>
              <button type="button" onClick={() => setShowCategoryForm(false)} style={buttonStyle(theme, "ghost")}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setShowCategoryForm(true)} style={buttonStyle(theme, "ghost")}>
            + Add Category
          </button>
        )}
      </div>

      <div style={{ ...panelStyle(theme, { padding: 18, display: "grid", gap: 12 }) }}>
        <div style={{ fontFamily: "Outfit, sans-serif", color: theme.text }}>Tags</div>
        <TagInput tags={post.tags} onChange={(nextTags) => onFieldChange("tags", nextTags)} />
      </div>

      <div style={{ ...panelStyle(theme, { padding: 18, display: "grid", gap: 12 }) }}>
        <div style={{ fontFamily: "Outfit, sans-serif", color: theme.text }}>Featured image</div>
        <FeaturedImagePicker
          value={post.featured_image}
          altText={post.featured_image_alt}
          onChange={(value) => onFieldChange("featured_image", value)}
          onAltChange={(value) => onFieldChange("featured_image_alt", value)}
        />
      </div>

      <SeoPanel
        post={post}
        analysis={analysis}
        loadingKey={loadingKey}
        onFieldChange={onFieldChange}
        onAnalyze={onAnalyze}
        onGenerateSchema={onGenerateSchema}
        onImprove={onImprove}
        onGenerateMeta={onGenerateMeta}
        onSuggestKeywords={onSuggestKeywords}
        onFixIssues={onFixIssues}
      />

      <div style={{ ...panelStyle(theme, { padding: 18, display: "grid", gap: 12 }) }}>
        <div style={{ fontFamily: "Outfit, sans-serif", color: theme.text }}>Revision history</div>
        <RevisionHistory postId={postId} onRestore={onRestoreRevision} />
      </div>
    </div>
  );
}

