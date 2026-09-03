import { useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { marked } from "marked";
import { usePosts } from "@/context/PostsContext";
import { api } from "@/lib/api";
import PostCard from "@/components/PostCard";
import { LikeButton } from "@/components/LikeButton";

const CATEGORY_COLORS: Record<string, string> = {
  Engineering: "#3B82F6",
  Design: "#A855F7",
  Personal: "#F59E0B",
  Career: "#10B981",
};

function ArrowLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
    </svg>
  );
}

export default function PostDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { getPostBySlug, posts, postLikes, toggleLike } = usePosts();
  const navigate = useNavigate();

  const post = slug ? getPostBySlug(slug) : undefined;
  const likes = post ? postLikes[post.id] || { totalLikes: 0, hasUserLiked: false } : null;

  useEffect(() => {
    if (slug && !post) navigate("/", { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug, post, navigate]);

  useEffect(() => {
    if (!post) return;
    api(`/posts/${post.id}/view`, { method: "POST" }).catch(() => {});
  }, [post?.id]);

  const htmlContent = useMemo(() => {
    if (!post) return "";
    return marked.parse(post.content) as string;
  }, [post]);

  const related = useMemo(() => {
    if (!post) return [];
    return posts
      .filter((p) => p.id !== post.id && p.status === "published" && (p.category === post.category || p.tags.some((t) => post.tags.includes(t))))
      .slice(0, 3);
  }, [post, posts]);

  if (!post) return null;

  const totalViews = (post.views + 1).toLocaleString();

  return (
    <div>
      {/* Cover image */}
      <div style={{ width: "100%", height: "min(480px, 60vw)", overflow: "hidden", backgroundColor: "var(--muted)", position: "relative" }}>
        <img
          src={post.coverImage}
          alt={post.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, var(--background) 0%, transparent 50%)" }} />
      </div>

      <div style={{ maxWidth: 740, margin: "0 auto", padding: "0 24px 80px" }}>
        {/* Back link */}
        <div style={{ marginTop: 32, marginBottom: 28 }}>
          <Link
            to="/"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--muted-fg)", textDecoration: "none", fontSize: "0.875rem", transition: "color 0.15s" }}
            onMouseOver={e => (e.currentTarget.style.color = "var(--foreground)")}
            onMouseOut={e => (e.currentTarget.style.color = "var(--muted-fg)")}
          >
            <ArrowLeft /> Back to blog
          </Link>
        </div>

        {/* Category */}
        <span style={{
          fontSize: "0.6875rem",
          fontWeight: 600,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          color: CATEGORY_COLORS[post.category] || "var(--accent)",
          fontFamily: "var(--font-mono)",
        }}>
          {post.category}
        </span>

        {/* Title */}
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1.875rem, 5vw, 2.75rem)",
          fontWeight: 600,
          lineHeight: 1.15,
          letterSpacing: "-0.02em",
          color: "var(--foreground)",
          margin: "14px 0 20px",
        }}>
          {post.title}
        </h1>

        {/* Excerpt */}
        <p style={{ fontSize: "1.1rem", color: "var(--muted-fg)", lineHeight: 1.65, margin: "0 0 28px", fontStyle: "italic" }}>
          {post.excerpt}
        </p>

        {/* Meta */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          paddingBottom: 28,
          borderBottom: "1px solid var(--border)",
          flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img
              src={post.author.avatar}
              alt={post.author.name}
              style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }}
            />
            <div>
              <div style={{ fontSize: "0.875rem", fontWeight: 500 }}>{post.author.name}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted-fg)" }}>{post.author.twitter}</div>
            </div>
          </div>
          <div style={{ width: 1, height: 32, backgroundColor: "var(--border)" }} />
          <div style={{ fontSize: "0.8125rem", color: "var(--muted-fg)", display: "flex", gap: 16, alignItems: "center" }}>
            <time>{new Date(post.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</time>
            <span>·</span>
            <span>{post.readTime} min read</span>
            <span>·</span>
            <span>{totalViews} views</span>
            <span>·</span>
            <LikeButton
              postId={post.id}
              totalLikes={likes?.totalLikes ?? 0}
              hasLiked={likes?.hasUserLiked ?? false}
              onToggleLike={() => toggleLike(post.id)}
            />
          </div>
        </div>

        {/* Tags */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 24, marginBottom: 40 }}>
          {post.tags.map((tag) => (
            <Link
              key={tag}
              to={`/?q=${tag}`}
              style={{
                padding: "4px 10px",
                borderRadius: 100,
                fontSize: "0.75rem",
                border: "1px solid var(--border)",
                color: "var(--muted-fg)",
                textDecoration: "none",
                transition: "all 0.15s",
              }}
              onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; (e.currentTarget as HTMLElement).style.color = "var(--accent)"; }}
              onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--muted-fg)"; }}
            >
              #{tag}
            </Link>
          ))}
        </div>

        {/* Content */}
        <div
          className="prose-blog"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {/* Author bio */}
        <div style={{
          marginTop: 48,
          padding: 24,
          backgroundColor: "var(--muted)",
          borderRadius: 8,
          border: "1px solid var(--border)",
          display: "flex",
          gap: 16,
          alignItems: "flex-start",
        }}>
          <img
            src={post.author.avatar}
            alt={post.author.name}
            style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
          />
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{post.author.name}</div>
            <div style={{ fontSize: "0.875rem", color: "var(--muted-fg)", lineHeight: 1.6 }}>{post.author.bio}</div>
          </div>
        </div>
      </div>

      {/* Related posts */}
      {related.length > 0 && (
        <div style={{ borderTop: "1px solid var(--border)", padding: "48px 24px 80px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.375rem", fontWeight: 600, marginBottom: 28 }}>
              More to read
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
              {related.map((p) => <PostCard key={p.id} post={p} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
