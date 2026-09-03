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
    <div className="flex items-center gap-2">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`flex items-center gap-1 px-3 py-1 rounded-md transition-colors ${
          hasLiked
            ? "bg-red-100 text-red-600 hover:bg-red-200"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title={error ? error : undefined}
      >
        <span className="text-lg">{hasLiked ? "❤️" : "🤍"}</span>
        <span className="text-sm font-medium">{totalLikes}</span>
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
