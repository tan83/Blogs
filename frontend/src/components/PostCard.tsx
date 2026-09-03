import { useState } from "react";
import { Link } from "react-router";
import type { Post } from "@/data/posts";
import { usePosts } from "@/context/PostsContext";
import { LikeButton } from "./LikeButton";

interface PostCardProps {
  post: Post;
  style?: React.CSSProperties;
}

const CATEGORY_COLORS: Record<string, string> = {
  Engineering: "#3B82F6",
  Design: "#A855F7",
  Personal: "#F59E0B",
  Career: "#10B981",
};

export default function PostCard({ post, style }: PostCardProps) {
  const [hovered, setHovered] = useState(false);
  const { postLikes, toggleLike } = usePosts();
  const likes = postLikes[post.id] || { totalLikes: 0, hasUserLiked: false };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLike(post.id);
  };

  return (
    <Link
      to={`/post/${post.slug}`}
      style={{ textDecoration: "none", color: "inherit", display: "block", ...style }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <article
        style={{
          backgroundColor: "var(--card)",
          border: `1px solid ${hovered ? "var(--accent)" : "var(--border)"}`,
          borderRadius: 8,
          overflow: "hidden",
          transition: "border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease",
          transform: hovered ? "translateY(-3px)" : "translateY(0)",
          boxShadow: hovered ? "0 12px 40px rgba(0,0,0,0.25)" : "none",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Cover image */}
        <div style={{ overflow: "hidden", aspectRatio: "16/9", backgroundColor: "var(--muted)", flexShrink: 0 }}>
          <img
            src={post.coverImage}
            alt={post.title}
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.4s ease",
              transform: hovered ? "scale(1.04)" : "scale(1)",
              display: "block",
            }}
          />
        </div>

        {/* Content */}
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
          {/* Category + read time */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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
            <span style={{ fontSize: "0.75rem", color: "var(--muted-fg)" }}>
              {post.readTime} min read
            </span>
          </div>

          {/* Title */}
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.125rem",
            fontWeight: 600,
            lineHeight: 1.3,
            color: "var(--card-fg)",
            margin: 0,
          }}>
            {post.title}
          </h2>

          {/* Excerpt */}
          <p style={{
            fontSize: "0.875rem",
            color: "var(--muted-fg)",
            lineHeight: 1.65,
            margin: 0,
            flex: 1,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {post.excerpt}
          </p>

          {/* Footer */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <img
                src={post.author.avatar}
                alt={post.author.name}
                style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover" }}
              />
              <span style={{ fontSize: "0.8rem", color: "var(--muted-fg)" }}>{post.author.name}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <time style={{ fontSize: "0.75rem", color: "var(--subtext)" }}>
                {new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </time>
              <div onClick={handleLikeClick}>
                <LikeButton
                  postId={post.id}
                  totalLikes={likes.totalLikes}
                  hasLiked={likes.hasUserLiked}
                  onToggleLike={() => toggleLike(post.id)}
                />
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
