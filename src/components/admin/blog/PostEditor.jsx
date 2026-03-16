import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { apiFetch } from "../../../hooks/useApi";
import { useTheme } from "../../../hooks/useTheme";
import { useViewport } from "../../../hooks/useViewport";
import { buttonStyle, inputStyle, panelStyle } from "../ui";
import AiDiffView from "./AiDiffView";
import MediaLibrary from "./MediaLibrary";
import PostEditorSidebar from "./PostEditorSidebar";
import TipTapEditor from "./TipTapEditor";

const EMPTY_POST = {
  title: "",
  slug: "",
  content: "",
  excerpt: "",
  category_id: "",
  tags: [],
  featured_image: "",
  featured_image_alt: "",
  featured_image_caption: "",
  meta_title: "",
  meta_description: "",
  focus_keyword: "",
  secondary_keywords: [],
  schema_type: "BlogPosting",
  schema_json: "",
  og_title: "",
  og_description: "",
  og_image: "",
  twitter_title: "",
  twitter_description: "",
  twitter_image: "",
  status: "draft",
  ai_improved_content: ""
};

function slugify(value = "") {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function hydratePost(post) {
  return {
    ...EMPTY_POST,
    ...post,
    tags: post?.tags || [],
    secondary_keywords: post?.secondary_keywords || []
  };
}

export default function PostEditor() {
  const theme = useTheme();
  const { isMobile, isTablet } = useViewport();
  const queryClient = useQueryClient();
  const { id } = useParams();
  const [postId, setPostId] = useState(id ? Number(id) : null);
  const [post, setPost] = useState(EMPTY_POST);
  const [analysis, setAnalysis] = useState(null);
  const [notice, setNotice] = useState(null);
  const [loadingKey, setLoadingKey] = useState("");
  const [stats, setStats] = useState({ words: 0, characters: 0, readingTime: 0 });
  const [lastSavedAt, setLastSavedAt] = useState("");
  const [dirty, setDirty] = useState(false);
  const [restoreDraft, setRestoreDraft] = useState(null);
  const [editorInstance, setEditorInstance] = useState(null);
  const [showEditorMedia, setShowEditorMedia] = useState(false);
  const [aiDraft, setAiDraft] = useState("");

  const categoriesQuery = useQuery({
    queryKey: ["editor-categories"],
    queryFn: () => apiFetch("/api/categories")
  });

  const postQuery = useQuery({
    queryKey: ["editor-post", postId],
    queryFn: () => apiFetch(`/api/posts/${postId}/edit`),
    enabled: Boolean(postId)
  });

  useEffect(() => {
    if (!postQuery.data?.post) {
      return;
    }
    const hydrated = hydratePost(postQuery.data.post);
    setPost(hydrated);
    setPostId(postQuery.data.post.id);
    setLastSavedAt(postQuery.data.post.updated_at);
    setStats({
      words: postQuery.data.post.word_count || 0,
      characters: (postQuery.data.post.content_raw || "").length,
      readingTime: postQuery.data.post.reading_time || 0
    });

    const storageKey = `draft_${postQuery.data.post.id}`;
    const savedDraft = window.localStorage.getItem(storageKey);
    if (savedDraft) {
      const parsed = JSON.parse(savedDraft);
      if (new Date(parsed.updatedAt).getTime() > new Date(postQuery.data.post.updated_at).getTime()) {
        setRestoreDraft(parsed);
      }
    }
  }, [postQuery.data?.post]);

  useEffect(() => {
    const storageKey = `draft_${postId || "new"}`;
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        ...post,
        updatedAt: new Date().toISOString()
      })
    );
  }, [post, postId]);

  useEffect(() => {
    if (!dirty || !postId) {
      return undefined;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        setLoadingKey("autosave");
        const data = await apiFetch(`/api/posts/${postId}/autosave`, {
          method: "POST",
          body: JSON.stringify(post)
        });
        setPost(hydratePost(data.post));
        setAnalysis(data.analysis);
        setLastSavedAt(new Date().toISOString());
        setDirty(false);
        setNotice({ type: "success", message: "Autosaved successfully." });
      } catch (error) {
        setNotice({ type: "error", message: error.message });
      } finally {
        setLoadingKey("");
      }
    }, 30000);

    return () => window.clearTimeout(timeoutId);
  }, [dirty, post, postId]);

  const createCategoryMutation = useMutation({
    mutationFn: (payload) =>
      apiFetch("/api/categories", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["editor-categories"] })
  });

  const previewUrl = useMemo(
    () => `https://automationpaths.com/blog/${post.slug || slugify(post.title)}?preview=true`,
    [post.slug, post.title]
  );

  const handleFieldChange = (field, value) => {
    setPost((current) => ({ ...current, [field]: value }));
    setDirty(true);
  };

  const persistPost = async (mode = "save", endpoint = null, payloadOverride = null) => {
    setLoadingKey(mode);
    try {
      const payload = payloadOverride || post;
      const method = postId && !endpoint ? "PUT" : "POST";
      const path = endpoint || (postId ? `/api/posts/${postId}` : "/api/posts");
      const data = await apiFetch(path, {
        method,
        body: JSON.stringify({
          ...payload,
          slug: payload.slug || slugify(payload.title),
          secondary_keywords: payload.secondary_keywords,
          tags: payload.tags
        })
      });
      setPostId(data.post.id);
      setPost(hydratePost(data.post));
      setAnalysis(data.analysis || analysis);
      setLastSavedAt(new Date().toISOString());
      setDirty(false);
      setNotice({ type: "success", message: mode === "publish" ? "Post published." : "Post saved." });
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-posts"] });
      return data;
    } catch (error) {
      setNotice({ type: "error", message: error.message });
      throw error;
    } finally {
      setLoadingKey("");
    }
  };

  const ensureSaved = async () => {
    if (postId) {
      return postId;
    }
    const data = await persistPost("save");
    return data.post.id;
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div>
        <h1 style={{ margin: 0, fontFamily: "Product Sans, sans-serif", color: theme.text }}>
          {postId ? "Edit Post" : "New Post"}
        </h1>
        <p style={{ margin: "8px 0 0", color: theme.text3, fontFamily: "Manrope, sans-serif" }}>
          Draft, optimize, and publish posts without leaving the CMS.
        </p>
      </div>

      {restoreDraft ? (
        <div
          style={{
            ...panelStyle(theme, {
              padding: 16,
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: isMobile ? "flex-start" : "center",
              flexDirection: isMobile ? "column" : "row"
            })
          }}
        >
          <div style={{ color: theme.text2, fontFamily: "Manrope, sans-serif" }}>
            You have unsaved local changes from {new Date(restoreDraft.updatedAt).toLocaleString()}. Restore them?
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", width: isMobile ? "100%" : "auto" }}>
            <button type="button" onClick={() => { setPost(hydratePost(restoreDraft)); setRestoreDraft(null); }} style={buttonStyle(theme, "primary")}>
              Restore
            </button>
            <button type="button" onClick={() => setRestoreDraft(null)} style={buttonStyle(theme, "ghost")}>
              Dismiss
            </button>
          </div>
        </div>
      ) : null}

      {notice ? (
        <div
          style={{
            ...panelStyle(theme, {
              padding: 14,
              color: notice.type === "error" ? "#b91c1c" : "#166534",
              background: notice.type === "error" ? "rgba(254,226,226,0.95)" : "rgba(220,252,231,0.95)"
            })
          }}
        >
          {notice.message}
        </div>
      ) : null}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            isMobile || isTablet
              ? "minmax(0, 1fr)"
              : "minmax(0, 1.75fr) minmax(320px, 0.95fr)",
          gap: isMobile ? 16 : 20,
          alignItems: "start"
        }}
      >
        <div style={{ display: "grid", gap: 18, minWidth: 0, gridTemplateColumns: "minmax(0, 1fr)" }}>
          <div style={{ ...panelStyle(theme, { padding: 22, display: "grid", gap: 16 }) }}>
            <input
              value={post.title}
              onChange={(event) => {
                handleFieldChange("title", event.target.value);
                if (!post.slug) {
                  handleFieldChange("slug", slugify(event.target.value));
                }
              }}
              onBlur={() => {
                if (!post.slug && post.title) {
                  handleFieldChange("slug", slugify(post.title));
                }
              }}
              placeholder="Add title..."
              style={{
                border: 0,
                outline: "none",
                background: "transparent",
                fontFamily: "Product Sans, sans-serif",
                fontSize: isMobile ? "clamp(1.7rem, 8vw, 2.4rem)" : "clamp(2rem, 3vw, 3rem)",
                color: theme.text,
                width: "100%",
                maxWidth: "100%",
                minWidth: 0,
                display: "block"
              }}
            />
            <input
              value={post.slug}
              onChange={(event) => handleFieldChange("slug", slugify(event.target.value))}
              placeholder="post-slug"
              style={inputStyle(theme)}
            />
            <div
              style={{
                color: theme.text3,
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "0.76rem",
                overflowWrap: "anywhere"
              }}
            >
              automationpaths.com/blog/{post.slug || slugify(post.title)}
            </div>
          </div>

          <TipTapEditor
            value={post.content}
            onChange={(html) => handleFieldChange("content", html)}
            onStatsChange={setStats}
            onReady={setEditorInstance}
            onRequestMedia={() => setShowEditorMedia(true)}
          />

          <div style={{ ...panelStyle(theme, { padding: 18, display: "grid", gap: 12 }) }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: isMobile ? "flex-start" : "center", flexDirection: isMobile ? "column" : "row" }}>
              <h2 style={{ margin: 0, fontFamily: "Product Sans, sans-serif", color: theme.text }}>Excerpt</h2>
              <button
                type="button"
                onClick={async () => {
                  setLoadingKey("excerpt");
                  try {
                    const data = await apiFetch("/api/ai/generate-excerpt", {
                      method: "POST",
                      body: JSON.stringify({ postId, content: post.content })
                    });
                    handleFieldChange("excerpt", data.excerpt);
                    setNotice({ type: "success", message: "Excerpt generated." });
                  } catch (error) {
                    setNotice({ type: "error", message: error.message });
                  } finally {
                    setLoadingKey("");
                  }
                }}
                style={buttonStyle(theme, "default")}
              >
                {loadingKey === "excerpt" ? "Generating..." : "Generate with AI"}
              </button>
            </div>
            <textarea
              value={post.excerpt}
              onChange={(event) => handleFieldChange("excerpt", event.target.value)}
              rows={5}
              style={inputStyle(theme, { resize: "vertical" })}
            />
          </div>

          {aiDraft ? (
            <AiDiffView
              original={post.content}
              improved={aiDraft}
              onApply={() => {
                handleFieldChange("content", aiDraft);
                setAiDraft("");
              }}
              onDiscard={() => setAiDraft("")}
            />
          ) : null}

          <div style={{ ...panelStyle(theme, { padding: 16, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }) }}>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", color: theme.text2, fontFamily: "IBM Plex Mono, monospace", fontSize: "0.8rem" }}>
              <span>{stats.words} words</span>
              <span>{stats.readingTime} min read</span>
              <span>{stats.characters} chars</span>
            </div>
            <div style={{ color: theme.text3, fontFamily: "Manrope, sans-serif", fontSize: "0.88rem" }}>
              {loadingKey === "autosave"
                ? "Saving..."
                : lastSavedAt
                  ? `Saved ${new Date(lastSavedAt).toLocaleTimeString()}`
                  : "Not saved yet"}
            </div>
          </div>
        </div>

        <PostEditorSidebar
          post={post}
          categories={categoriesQuery.data?.categories || []}
          analysis={analysis}
          loadingKey={loadingKey}
          onFieldChange={handleFieldChange}
          onCreateCategory={async (payload) => {
            const data = await createCategoryMutation.mutateAsync(payload);
            return data.category;
          }}
          onSaveDraft={async () => {
            if (postId) {
              await persistPost("save", `/api/posts/${postId}/draft`);
            } else {
              await persistPost("save");
            }
          }}
          onPublish={async () => {
            const ensuredId = await ensureSaved();
            await persistPost("publish", `/api/posts/${ensuredId}/publish`);
          }}
          onMoveToTrash={async () => {
            if (!postId) return;
            if (!window.confirm("Move this post to trash?")) return;
            setLoadingKey("trash");
            try {
              await apiFetch(`/api/posts/${postId}`, { method: "DELETE" });
              setNotice({ type: "success", message: "Post moved to trash." });
            } catch (error) {
              setNotice({ type: "error", message: error.message });
            } finally {
              setLoadingKey("");
            }
          }}
          onSchedule={async (scheduledAt) => {
            const ensuredId = await ensureSaved();
            await persistPost("schedule", `/api/posts/${ensuredId}/schedule`, {
              ...post,
              scheduled_at: new Date(scheduledAt).toISOString()
            });
          }}
          onAnalyze={async () => {
            setLoadingKey("analyze");
            try {
              const data = await apiFetch("/api/seo/analyze", {
                method: "POST",
                body: JSON.stringify({
                  title: post.title,
                  content: post.content,
                  focusKeyword: post.focus_keyword,
                  metaTitle: post.meta_title,
                  metaDescription: post.meta_description,
                  slug: post.slug || slugify(post.title)
                })
              });
              setAnalysis(data.analysis);
            } catch (error) {
              setNotice({ type: "error", message: error.message });
            } finally {
              setLoadingKey("");
            }
          }}
          onGenerateSchema={async () => {
            setLoadingKey("schema");
            try {
              const data = await apiFetch("/api/ai/generate-schema", {
                method: "POST",
                body: JSON.stringify({
                  postId,
                  title: post.title,
                  content: post.content,
                  schemaType: post.schema_type,
                  publishedAt: post.published_at,
                  updatedAt: post.updated_at,
                  slug: post.slug,
                  featuredImage: post.featured_image,
                  categoryName: categoriesQuery.data?.categories?.find((item) => item.id === post.category_id)?.name,
                  focusKeyword: post.focus_keyword
                })
              });
              handleFieldChange("schema_json", data.schema_json);
            } catch (error) {
              setNotice({ type: "error", message: error.message });
            } finally {
              setLoadingKey("");
            }
          }}
          onImprove={async () => {
            setLoadingKey("improve");
            try {
              const data = await apiFetch("/api/ai/improve-seo", {
                method: "POST",
                body: JSON.stringify({
                  postId,
                  content: post.content,
                  focusKeyword: post.focus_keyword,
                  issues: analysis?.checks?.filter((check) => check.status !== "pass").map((check) => check.fix || check.message)
                })
              });
              setAiDraft(data.content);
            } catch (error) {
              setNotice({ type: "error", message: error.message });
            } finally {
              setLoadingKey("");
            }
          }}
          onGenerateMeta={async () => {
            setLoadingKey("meta");
            try {
              const data = await apiFetch("/api/ai/generate-meta", {
                method: "POST",
                body: JSON.stringify({ postId, title: post.title, content: post.content, focusKeyword: post.focus_keyword })
              });
              setPost((current) => ({
                ...current,
                meta_title: data.meta_title || current.meta_title,
                meta_description: data.meta_description || current.meta_description,
                og_title: data.og_title || current.og_title,
                og_description: data.og_description || current.og_description,
                slug: data.slug || current.slug,
                excerpt: data.excerpt || current.excerpt
              }));
              setDirty(true);
            } catch (error) {
              setNotice({ type: "error", message: error.message });
            } finally {
              setLoadingKey("");
            }
          }}
          onSuggestKeywords={async () => {
            setLoadingKey("keywords");
            try {
              const data = await apiFetch("/api/ai/suggest-keywords", {
                method: "POST",
                body: JSON.stringify({ postId, title: post.title, content: post.content })
              });
              setPost((current) => ({
                ...current,
                focus_keyword: data.primary_keyword || current.focus_keyword,
                secondary_keywords: data.secondary_keywords || current.secondary_keywords
              }));
              setDirty(true);
            } catch (error) {
              setNotice({ type: "error", message: error.message });
            } finally {
              setLoadingKey("");
            }
          }}
          onFixIssues={async () => {
            setLoadingKey("fix");
            try {
              const data = await apiFetch("/api/ai/fix-issues", {
                method: "POST",
                body: JSON.stringify({
                  postId,
                  content: post.content,
                  focusKeyword: post.focus_keyword,
                  issues: analysis?.checks?.filter((check) => check.status !== "pass").map((check) => ({
                    issue_id: check.id,
                    message: check.message,
                    fix: check.fix
                  }))
                })
              });
              const nextPost = { ...post };
              (data.fixes || []).forEach((item) => {
                if (item.issue_id.includes("meta_description")) nextPost.meta_description = item.fixed_content;
                if (item.issue_id.includes("meta_title")) nextPost.meta_title = item.fixed_content;
                if (item.issue_id.includes("excerpt")) nextPost.excerpt = item.fixed_content;
              });
              setPost(nextPost);
              setDirty(true);
              setNotice({ type: "success", message: `Received ${data.fixes?.length || 0} targeted fixes.` });
            } catch (error) {
              setNotice({ type: "error", message: error.message });
            } finally {
              setLoadingKey("");
            }
          }}
          onRestoreRevision={async (revisionId) => {
            if (!postId) return;
            if (!window.confirm("Restore this revision?")) return;
            setLoadingKey("restore");
            try {
              await apiFetch(`/api/posts/${postId}/revisions/${revisionId}/restore`, { method: "POST" });
              const data = await apiFetch(`/api/posts/${postId}/edit`);
              setPost(hydratePost(data.post));
              setNotice({ type: "success", message: "Revision restored." });
            } catch (error) {
              setNotice({ type: "error", message: error.message });
            } finally {
              setLoadingKey("");
            }
          }}
          postId={postId}
          previewUrl={previewUrl}
        />
      </div>

      {showEditorMedia ? (
        <MediaLibrary
          selectionMode
          onClose={() => setShowEditorMedia(false)}
          onSelect={(item) => {
            editorInstance?.chain().focus().setImage({ src: item.url, alt: item.original_name }).run();
            setShowEditorMedia(false);
          }}
        />
      ) : null}
    </div>
  );
}
