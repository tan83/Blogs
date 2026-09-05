import { useState } from "react";

interface LikeButtonProps {
  postId: string;
  totalLikes: number;
  hasLiked: boolean;
  onToggleLike: () => Promise<void>;
}

export function LikeButton({
  postId,
  totalLikes,
  hasLiked,
  onToggleLike,
}: LikeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      await onToggleLike();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to toggle like";
      setError(message);
      console.error("Like error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="post-like-wrap">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`post-like-button${hasLiked ? " is-liked" : ""}`}
        title={error ? error : undefined}
      >
        <span className="post-like-icon" aria-hidden="true">{hasLiked ? "♥" : "♡"}</span>
        <span>{totalLikes}</span>
      </button>
      {error && <span className="post-like-error">{error}</span>}
    </div>
  );
}
