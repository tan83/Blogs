import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import PostCard from "@/components/PostCard";
import { usePosts } from "@/context/PostsContext";
import type { Post } from "@/data/posts";

const PAGE_SIZE = 6;

const CATEGORY_COLORS: Record<string, string> = {
  Engineering: "#3B82F6",
  Design: "#A855F7",
  Personal: "#F59E0B",
  Career: "#10B981",
};

function FeaturedPost({ post }: { post: Post }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      to={`/post/${post.slug}`}
      style={{ textDecoration: "none", color: "inherit", display: "block" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        position: "relative",
        height: "min(560px, 72vw)",
        overflow: "hidden",
        borderRadius: 12,
        cursor: "pointer",
        backgroundColor: "var(--muted)",
      }}>
        <img
          src={post.coverImage}
          alt={post.title}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.5s ease",
            transform: hovered ? "scale(1.03)" : "scale(1)",
          }}
        />
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%)",
        }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "clamp(24px, 4vw, 48px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span style={{
              fontSize: "0.6875rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--accent)",
              fontFamily: "var(--font-mono)",
            }}>
              Featured
            </span>
            <span style={{ width: 1, height: 12, backgroundColor: "rgba(255,255,255,0.3)" }} />
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
          </div>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.75rem, 4vw, 3rem)",
            fontWeight: 600,
            lineHeight: 1.15,
            color: "#EFEFEF",
            margin: "0 0 16px",
            maxWidth: 720,
            letterSpacing: "-0.02em",
          }}>
            {post.title}
          </h1>
          <p style={{
            fontSize: "1rem",
            color: "rgba(239,239,239,0.72)",
            lineHeight: 1.65,
            maxWidth: 560,
            margin: "0 0 24px",
          }}>
            {post.excerpt}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src={post.author.avatar} alt={post.author.name} style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.2)" }} />
            <div>
              <div style={{ fontSize: "0.875rem", color: "#EFEFEF", fontWeight: 500 }}>{post.author.name}</div>
              <div style={{ fontSize: "0.75rem", color: "rgba(239,239,239,0.55)" }}>
                {new Date(post.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · {post.readTime} min read
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function BlogHome() {
  const { posts, loading } = usePosts();
  const [searchParams] = useSearchParams();
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const query = searchParams.get("q") || "";

  const published = useMemo(() => posts.filter((p) => p.status === "published"), [posts]);
  const featured = published.find((p) => p.featured) || published[0];

  const allTags = useMemo(() => Array.from(new Set(published.flatMap((p) => p.tags))), [published]);

  const filtered = useMemo(() => {
    return published.filter((p) => {
      if (p.featured && !activeTag && !query) return false;
      if (activeTag && !p.tags.includes(activeTag)) return false;
      if (query) {
        const q = query.toLowerCase();
        return p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q) || p.tags.some((t) => t.includes(q));
      }
      return true;
    });
  }, [published, activeTag, query]);

  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  useEffect(() => {
    setPage(1);
  }, [activeTag, query]);

  const pillStyle = (active: boolean) => ({
    padding: "6px 14px",
    borderRadius: 100,
    fontSize: "0.8125rem",
    border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
    backgroundColor: active ? "var(--accent)" : "transparent",
    color: active ? "var(--accent-fg)" : "var(--muted-fg)",
    cursor: "pointer",
    transition: "all 0.15s",
    whiteSpace: "nowrap" as const,
    fontWeight: active ? 500 : 400,
  });

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(24px, 4vw, 48px) 24px 80px" }}>
      {/* Search result heading */}
      {query && (
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", fontWeight: 600 }}>
            Results for "<span style={{ color: "var(--accent)" }}>{query}</span>"
          </h1>
          <p style={{ color: "var(--muted-fg)", marginTop: 6, fontSize: "0.875rem" }}>
            {filtered.length} {filtered.length === 1 ? "post" : "posts"} found
          </p>
        </div>
      )}

      {/* Featured post */}
      {featured && !activeTag && !query && (
        <div style={{ marginBottom: 48 }}>
          <FeaturedPost post={featured} />
        </div>
      )}

      {/* Tag filter */}
      {!query && (
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 36 }}>
          <button
            onClick={() => setActiveTag(null)}
            style={pillStyle(activeTag === null)}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag === activeTag ? null : tag)}
              style={pillStyle(activeTag === tag)}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Post grid */}
      {loading && visible.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "var(--muted-fg)" }}>
          <p style={{ fontSize: "1.125rem" }}>Loading posts…</p>
        </div>
      ) : visible.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "var(--muted-fg)" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>✦</div>
          <p style={{ fontSize: "1.125rem" }}>No posts found{query ? ` for "${query}"` : ""}.</p>
          <Link to="/" style={{ color: "var(--accent)", fontSize: "0.875rem" }}>← Back to all posts</Link>
        </div>
      ) : (
        <div
          ref={containerRef}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 340px), 1fr))",
            gap: 24,
          }}
        >
          {visible.map((post, i) => (
            <div
              key={post.id}
              className="animate-fade-up"
              style={{ animationDelay: `${(i % PAGE_SIZE) * 60}ms`, animationFillMode: "both" }}
            >
              <PostCard post={post} style={{ height: "100%" }} />
            </div>
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 48 }}>
          <button
            onClick={() => setPage((p) => p + 1)}
            style={{
              padding: "12px 32px",
              border: "1px solid var(--border)",
              borderRadius: 6,
              backgroundColor: "transparent",
              color: "var(--foreground)",
              fontSize: "0.875rem",
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              transition: "all 0.15s",
            }}
            onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; (e.currentTarget as HTMLElement).style.color = "var(--accent)"; }}
            onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--foreground)"; }}
          >
            Load more posts
          </button>
        </div>
      )}
    </div>
  );
}
