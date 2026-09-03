const API_URL: string = (import.meta.env.VITE_API_URL as string | undefined) ?? "/api";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      credentials: "include",
    });
  } catch {
    throw new ApiError("No se pudo conectar con el servidor", 0);
  }

  if (!res.ok) {
    let message = `Error ${res.status}`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
    } catch {
      // keep default message
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/**
 * Toggle a like for a post (like/unlike)
 */
export interface LikeToggleResponse {
  hasLiked: boolean;
  totalLikes: number;
}

export async function togglePostLike(
  postId: string,
  sessionId: string
): Promise<LikeToggleResponse> {
  return api<LikeToggleResponse>(`/posts/${postId}/like`, {
    method: "POST",
    body: JSON.stringify({ sessionId }),
  });
}

/**
 * Get like information for a post
 */
export interface PostLikesResponse {
  totalLikes: number;
  hasUserLiked: boolean;
}

export async function getPostLikes(
  postId: string,
  sessionId: string
): Promise<PostLikesResponse> {
  return api<PostLikesResponse>(`/posts/${postId}/likes?sessionId=${encodeURIComponent(sessionId)}`);
}