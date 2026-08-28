import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { usePosts } from "@/context/PostsContext";

const CATEGORY_COLORS: Record<string, string> = {
  Engineering: "#3B82F6",
  Design: "#A855F7",
  Personal: "#F59E0B",
  Career: "#10B981",
};

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div style={{
      backgroundColor: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: 8,
      padding: "20px 24px",
    }}>
      <div style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", letterSpacing: "0.06em", color: "var(--muted-fg)", textTransform: "uppercase", marginBottom: 10 }}>
        {label}
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: "2.25rem", fontWeight: 600, color: accent ? "var(--accent)" : "var(--foreground)", lineHeight: 1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: "0.8125rem", color: "var(--muted-fg)", marginTop: 6 }}>{sub}</div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { posts, deletePost, updatePost } = usePosts();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  const published = posts.filter((p) => p.status === "published");
  const drafts = posts.filter((p) => p.status === "draft");
  const totalViews = posts.reduce((sum, p) => sum + p.views, 0);
  const avgViews = published.length ? Math.round(totalViews / published.length) : 0;

  const filtered = filter === "all" ? posts : posts.filter((p) => p.status === filter);

  const handleDelete = async (id: string) => {
    if (confirmDelete === id) {
      setConfirmDelete(null);
      try {
        await deletePost(id);
      } catch (error) {
        console.error("Failed to delete post", error);
      }
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  const toggleStatus = async (id: string, current: "published" | "draft") => {
    try {
      await updatePost(id, { status: current === "published" ? "draft" : "published" });
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const filterPillStyle = (active: boolean) => ({
    padding: "6px 14px",
    borderRadius: 100,
    fontSize: "0.8125rem",
    border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
    backgroundColor: active ? "var(--accent)" : "transparent",
    color: active ? "var(--accent-fg)" : "var(--muted-fg)",
    cursor: "pointer",
    transition: "all 0.15s",
    fontWeight: active ? 500 : 400,
    fontFamily: "var(--font-sans)",
  });

  return (
    <div style={{ padding: "32px 36px", flex: 1, overflow: "auto" }}>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.625rem", fontWeight: 600, margin: 0 }}>Dashboard</h1>
          <p style={{ color: "var(--muted-fg)", margin: "4px 0 0", fontSize: "0.875rem" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <Link
          to="/admin/posts/new"
          style={{
            padding: "10px 20px",
            backgroundColor: "var(--accent)",
            color: "var(--accent-fg)",
            borderRadius: 6,
            textDecoration: "none",
            fontSize: "0.875rem",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Post
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 36 }}>
        <StatCard label="Total Posts" value={posts.length} sub={`${published.length} published`} />
        <StatCard label="Published" value={published.length} accent />
        <StatCard label="Drafts" value={drafts.length} sub="awaiting review" />
        <StatCard label="Total Views" value={totalViews.toLocaleString()} sub={`avg ${avgViews.toLocaleString()}/post`} />
      </div>

      {/* Posts table */}
      <div style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
        {/* Table header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 600, margin: 0 }}>
            All Posts
          </h2>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setFilter("all")} style={filterPillStyle(filter === "all")}>All ({posts.length})</button>
            <button onClick={() => setFilter("published")} style={filterPillStyle(filter === "published")}>Published ({published.length})</button>
            <button onClick={() => setFilter("draft")} style={filterPillStyle(filter === "draft")}>Drafts ({drafts.length})</button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Title", "Category", "Status", "Views", "Date", "Actions"].map((col) => (
                  <th key={col} style={{
                    padding: "10px 20px",
                    textAlign: "left",
                    fontSize: "0.6875rem",
                    fontFamily: "var(--font-mono)",
                    fontWeight: 500,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "var(--muted-fg)",
                    whiteSpace: "nowrap",
                  }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((post) => (
                <tr
                  key={post.id}
                  style={{ borderBottom: "1px solid var(--border)", transition: "background 0.1s" }}
                  onMouseOver={e => (e.currentTarget.style.backgroundColor = "var(--muted)")}
                  onMouseOut={e => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <td style={{ padding: "14px 20px", maxWidth: 320 }}>
                    <div style={{ fontWeight: 500, fontSize: "0.9rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 280 }}>
                      {post.title}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--muted-fg)", marginTop: 3, fontFamily: "var(--font-mono)" }}>
                      /{post.slug}
                    </div>
                  </td>
                  <td style={{ padding: "14px 20px", whiteSpace: "nowrap" }}>
                    <span style={{
                      fontSize: "0.6875rem",
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: CATEGORY_COLORS[post.category] || "var(--accent)",
                      fontFamily: "var(--font-mono)",
                    }}>
                      {post.category}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <button
                      onClick={() => toggleStatus(post.id, post.status)}
                      style={{
                        padding: "3px 10px",
                        borderRadius: 100,
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        border: "1px solid",
                        cursor: "pointer",
                        backgroundColor: "transparent",
                        fontFamily: "var(--font-sans)",
                        borderColor: post.status === "published" ? "var(--accent)" : "var(--border)",
                        color: post.status === "published" ? "var(--accent)" : "var(--muted-fg)",
                        transition: "all 0.15s",
                      }}
                    >
                      {post.status}
                    </button>
                  </td>
                  <td style={{ padding: "14px 20px", color: "var(--muted-fg)", fontSize: "0.875rem", whiteSpace: "nowrap" }}>
                    {post.views.toLocaleString()}
                  </td>
                  <td style={{ padding: "14px 20px", color: "var(--muted-fg)", fontSize: "0.8125rem", whiteSpace: "nowrap" }}>
                    {new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td style={{ padding: "14px 20px", whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => navigate(`/admin/posts/${post.id}/edit`)}
                        style={{
                          padding: "5px 12px",
                          background: "var(--muted)",
                          border: "1px solid var(--border)",
                          borderRadius: 5,
                          color: "var(--foreground)",
                          fontSize: "0.75rem",
                          cursor: "pointer",
                          fontFamily: "var(--font-sans)",
                          transition: "border-color 0.15s",
                        }}
                        onMouseOver={e => (e.currentTarget.style.borderColor = "var(--accent)")}
                        onMouseOut={e => (e.currentTarget.style.borderColor = "var(--border)")}
                      >
                        Edit
                      </button>
                      <Link
                        to={`/post/${post.slug}`}
                        style={{
                          padding: "5px 12px",
                          background: "var(--muted)",
                          border: "1px solid var(--border)",
                          borderRadius: 5,
                          color: "var(--muted-fg)",
                          fontSize: "0.75rem",
                          textDecoration: "none",
                          transition: "all 0.15s",
                        }}
                        onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--foreground)"; }}
                        onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--muted-fg)"; }}
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id)}
                        style={{
                          padding: "5px 12px",
                          background: confirmDelete === post.id ? "rgba(239,68,68,0.15)" : "transparent",
                          border: `1px solid ${confirmDelete === post.id ? "rgba(239,68,68,0.5)" : "var(--border)"}`,
                          borderRadius: 5,
                          color: confirmDelete === post.id ? "#EF4444" : "var(--muted-fg)",
                          fontSize: "0.75rem",
                          cursor: "pointer",
                          fontFamily: "var(--font-sans)",
                          transition: "all 0.15s",
                        }}
                      >
                        {confirmDelete === post.id ? "Confirm" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div style={{ padding: 48, textAlign: "center", color: "var(--muted-fg)" }}>
              No posts found.
              <Link to="/admin/posts/new" style={{ display: "block", color: "var(--accent)", marginTop: 8, fontSize: "0.875rem" }}>Create your first post →</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
