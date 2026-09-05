import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { marked } from "marked";
import { usePosts } from "@/context/PostsContext";
import { api } from "@/lib/api";
import { AUTHOR, CATEGORIES } from "@/data/posts";

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

const PLACEHOLDER = `## Introduction

Write your opening paragraph here. Hook the reader with the core idea.

## The Core Argument

Develop your main point. Use concrete examples, data, or anecdotes.

> Block quotes are great for memorable pull quotes or external citations.

## Code Example

\`\`\`typescript
// If you're writing about code, include working examples
function example(input: string): string {
  return input.trim();
}
\`\`\`

## Conclusion

Wrap up with your key takeaway. What should the reader remember?`;

export default function AdminEditor() {
  const { id } = useParams<{ id?: string }>();
  const { getPostById, addPost, updatePost } = usePosts();
  const navigate = useNavigate();

  const existing = id ? getPostById(id) : undefined;
  const isEditing = Boolean(existing);

  const [title, setTitle] = useState(existing?.title || "");
  const [slug, setSlug] = useState(existing?.slug || "");
  const [excerpt, setExcerpt] = useState(existing?.excerpt || "");
  const [content, setContent] = useState(existing?.content || PLACEHOLDER);
  const [category, setCategory] = useState(existing?.category || CATEGORIES[0]);
  const [tags, setTags] = useState(existing?.tags.join(", ") || "");
  const [coverImage, setCoverImage] = useState(existing?.coverImage || "");
  const [status, setStatus] = useState<"published" | "draft">(existing?.status || "draft");
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [targetLanguage, setTargetLanguage] = useState<"es" | "en">("es");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [translating, setTranslating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const autoSlug = useMemo(() => slugify(title), [title]);

  useEffect(() => {
    if (!isEditing && title && !slug) setSlug(autoSlug);
  }, [autoSlug, isEditing, title, slug]);

  const previewHtml = useMemo(() => marked.parse(content) as string, [content]);

  const handleTranslate = async () => {
    const payload = {
      title: title.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      sourceLanguage: "auto",
      targetLanguage,
    };

    if (!payload.title && !payload.excerpt && !payload.content) {
      setSaveError("Escribe algo para traducir primero");
      return;
    }

    try {
      setTranslating(true);
      setSaveError("");

      const result = await api<{ title?: string; excerpt?: string; content?: string }>('/posts/translate', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (result.title) setTitle(result.title);
      if (result.excerpt) setExcerpt(result.excerpt);
      if (result.content) setContent(result.content);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'No se pudo traducir');
    } finally {
      setTranslating(false);
    }
  };

  const handleSave = async (saveStatus: "draft" | "published") => {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    setSaveError("");

    const postData = {
      slug: slug || autoSlug,
      title: title.trim(),
      excerpt: excerpt.trim() || title.trim(),
      content,
      author: AUTHOR,
      category,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      coverImage: coverImage || "https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=1200&h=700&fit=crop&auto=format",
      publishedAt: existing?.publishedAt || new Date().toISOString().split("T")[0],
      readTime: Math.max(1, Math.round(content.split(" ").length / 200)),
      status: saveStatus,
      views: existing?.views || 0,
    };

    try {
      if (isEditing && id) {
        await updatePost(id, postData);
      } else {
        await addPost(postData);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      setStatus(saveStatus);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const dataUrl = await readFileAsDataURL(file);
      const res = await api<{ url: string }>("/images", {
        method: "POST",
        body: JSON.stringify({ data: dataUrl, mimeType: file.type }),
      });
      setCoverImage(res.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "9px 12px",
    backgroundColor: "var(--muted)",
    border: "1px solid var(--border)",
    borderRadius: 5,
    color: "var(--foreground)",
    fontSize: "0.875rem",
    fontFamily: "var(--font-sans)",
    outline: "none",
    transition: "border-color 0.15s",
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "6px 16px",
    border: "none",
    background: active ? "var(--muted)" : "transparent",
    color: active ? "var(--foreground)" : "var(--muted-fg)",
    cursor: "pointer",
    fontSize: "0.8125rem",
    fontWeight: active ? 500 : 400,
    borderRadius: 5,
    fontFamily: "var(--font-sans)",
    transition: "all 0.15s",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Top bar */}
      <div style={{
        padding: "16px 24px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        flexShrink: 0,
        backgroundColor: "var(--background)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button
            onClick={() => navigate("/admin")}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "var(--muted-fg)", cursor: "pointer", fontSize: "0.875rem", padding: 0, fontFamily: "var(--font-sans)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
            </svg>
            Back
          </button>
          <span style={{ color: "var(--border)" }}>|</span>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 600, margin: 0 }}>
            {isEditing ? "Edit Post" : "New Post"}
          </h1>
          <span style={{
            padding: "2px 8px",
            borderRadius: 100,
            fontSize: "0.6875rem",
            fontFamily: "var(--font-mono)",
            border: `1px solid ${status === "published" ? "var(--accent)" : "var(--border)"}`,
            color: status === "published" ? "var(--accent)" : "var(--muted-fg)",
          }}>
            {status}
          </span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value as "es" | "en")}
            style={{
              ...inputStyle,
              width: "auto",
              minWidth: 90,
              backgroundColor: "var(--muted)",
              color: "var(--foreground)",
            }}
          >
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
          <button
            onClick={handleTranslate}
            disabled={translating}
            style={{
              padding: "8px 16px",
              background: "var(--muted)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              color: "var(--foreground)",
              fontSize: "0.875rem",
              cursor: translating ? "not-allowed" : "pointer",
              fontFamily: "var(--font-sans)",
              opacity: translating ? 0.6 : 1,
              transition: "all 0.15s",
            }}
          >
            {translating ? "Traduciendo…" : "Traducir"}
          </button>
          {saveError && (
            <span style={{ fontSize: "0.8125rem", color: "#EF4444", display: "flex", alignItems: "center", gap: 4 }}>
              {saveError}
            </span>
          )}
          {saved && (
            <span style={{ fontSize: "0.8125rem", color: "var(--accent)", display: "flex", alignItems: "center", gap: 4 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Saved
            </span>
          )}
          <button
            onClick={() => handleSave("draft")}
            disabled={saving || !title.trim()}
            style={{
              padding: "8px 16px",
              background: "var(--muted)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              color: "var(--foreground)",
              fontSize: "0.875rem",
              cursor: saving || !title.trim() ? "not-allowed" : "pointer",
              fontFamily: "var(--font-sans)",
              opacity: saving || !title.trim() ? 0.5 : 1,
              transition: "all 0.15s",
            }}
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSave("published")}
            disabled={saving || !title.trim()}
            style={{
              padding: "8px 20px",
              backgroundColor: "var(--accent)",
              color: "var(--accent-fg)",
              border: "none",
              borderRadius: 6,
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: saving || !title.trim() ? "not-allowed" : "pointer",
              fontFamily: "var(--font-sans)",
              opacity: saving || !title.trim() ? 0.5 : 1,
              transition: "opacity 0.15s",
            }}
          >
            {saving ? "Saving…" : "Publish"}
          </button>
        </div>
      </div>

      {/* Title input */}
      <div style={{ padding: "24px 24px 0", flexShrink: 0 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title…"
          style={{
            width: "100%",
            background: "none",
            border: "none",
            borderBottom: "2px solid var(--border)",
            color: "var(--foreground)",
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.5rem, 3vw, 2rem)",
            fontWeight: 600,
            outline: "none",
            padding: "0 0 12px",
            letterSpacing: "-0.02em",
            transition: "border-color 0.15s",
          }}
          onFocus={e => (e.currentTarget.style.borderBottomColor = "var(--accent)")}
          onBlur={e => (e.currentTarget.style.borderBottomColor = "var(--border)")}
        />
      </div>

      {/* Main editor area */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", gap: 0 }}>
        {/* Editor column */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: "1px solid var(--border)", minWidth: 0 }}>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, padding: "12px 24px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
            <button onClick={() => setActiveTab("write")} style={tabStyle(activeTab === "write")}>Write</button>
            <button onClick={() => setActiveTab("preview")} style={tabStyle(activeTab === "preview")}>Preview</button>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: "0.75rem", color: "var(--muted-fg)", display: "flex", alignItems: "center" }}>
              {Math.max(1, Math.round(content.split(" ").length / 200))} min read
            </span>
          </div>

          {/* Write / Preview */}
          {activeTab === "write" ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{
                flex: 1,
                resize: "none",
                background: "transparent",
                border: "none",
                color: "var(--foreground)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.875rem",
                lineHeight: 1.75,
                outline: "none",
                padding: "24px",
                overflowY: "auto",
              }}
              placeholder={PLACEHOLDER}
              spellCheck
            />
          ) : (
            <div
              className="prose-blog"
              style={{ flex: 1, overflowY: "auto", padding: "24px" }}
              dangerouslySetInnerHTML={{ __html: previewHtml || "<p style='color:var(--muted-fg)'>Nothing to preview yet.</p>" }}
            />
          )}
        </div>

        {/* Metadata sidebar */}
        <div style={{
          width: 260,
          flexShrink: 0,
          overflowY: "auto",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: 18,
          backgroundColor: "var(--background)",
        }}>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontFamily: "var(--font-mono)", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted-fg)", marginBottom: 6 }}>
              Slug
            </label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder={autoSlug || "post-url-slug"}
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontFamily: "var(--font-mono)", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted-fg)", marginBottom: 6 }}>
              Excerpt
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief description shown in post cards…"
              rows={3}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.55 }}
              onFocus={e => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontFamily: "var(--font-mono)", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted-fg)", marginBottom: 6 }}>
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ ...inputStyle, cursor: "pointer" }}
              onFocus={e => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c} style={{ backgroundColor: "var(--muted)" }}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontFamily: "var(--font-mono)", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted-fg)", marginBottom: 6 }}>
              Tags
            </label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="typescript, design, tools"
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
            />
            <div style={{ fontSize: "0.6875rem", color: "var(--muted-fg)", marginTop: 4 }}>Comma-separated</div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontFamily: "var(--font-mono)", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted-fg)", marginBottom: 6 }}>
              Cover Image
            </label>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                style={{ display: "none" }}
                onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{
                  flex: 1,
                  padding: "9px 12px",
                  backgroundColor: "var(--muted)",
                  border: "1px solid var(--border)",
                  borderRadius: 5,
                  color: "var(--foreground)",
                  fontSize: "0.8125rem",
                  cursor: uploading ? "not-allowed" : "pointer",
                  fontFamily: "var(--font-sans)",
                  opacity: uploading ? 0.6 : 1,
                  transition: "opacity 0.15s",
                  whiteSpace: "nowrap",
                }}
              >
                {uploading ? "Uploading…" : "Upload image"}
              </button>
              <input
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="…or paste an image URL"
                style={{ ...inputStyle, flex: 2 }}
                onFocus={e => (e.currentTarget.style.borderColor = "var(--accent)")}
                onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
              />
            </div>
            {uploadError && (
              <div style={{ fontSize: "0.75rem", color: "#EF4444", marginBottom: 6 }}>{uploadError}</div>
            )}
            <div style={{ fontSize: "0.6875rem", color: "var(--muted-fg)", marginBottom: 8 }}>
              Stored in the database as base64 (max 4.5 MB).
            </div>
            {coverImage && (
              <img
                src={coverImage + (coverImage.includes("?") ? "&" : "?") + "w=240&h=120&fit=crop&auto=format"}
                alt="Cover preview"
                style={{ marginTop: 8, width: "100%", height: 80, objectFit: "cover", borderRadius: 5, border: "1px solid var(--border)" }}
                onError={e => (e.currentTarget.style.display = "none")}
              />
            )}
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontFamily: "var(--font-mono)", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted-fg)", marginBottom: 8 }}>
              Status
            </label>
            <div style={{ display: "flex", borderRadius: 6, overflow: "hidden", border: "1px solid var(--border)" }}>
              {(["draft", "published"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  style={{
                    flex: 1,
                    padding: "8px",
                    border: "none",
                    background: status === s ? (s === "published" ? "var(--accent)" : "var(--muted)") : "transparent",
                    color: status === s ? (s === "published" ? "var(--accent-fg)" : "var(--foreground)") : "var(--muted-fg)",
                    cursor: "pointer",
                    fontSize: "0.8125rem",
                    fontWeight: status === s ? 500 : 400,
                    fontFamily: "var(--font-sans)",
                    transition: "all 0.15s",
                    textTransform: "capitalize",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Excerpt character count */}
          <div style={{
            padding: "12px",
            backgroundColor: "var(--muted)",
            borderRadius: 6,
            border: "1px solid var(--border)",
            fontSize: "0.75rem",
            color: "var(--muted-fg)",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Word count</span>
              <span style={{ color: "var(--foreground)", fontFamily: "var(--font-mono)" }}>
                {content.split(/\s+/).filter(Boolean).length}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Est. read time</span>
              <span style={{ color: "var(--foreground)", fontFamily: "var(--font-mono)" }}>
                {Math.max(1, Math.round(content.split(" ").length / 200))} min
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
