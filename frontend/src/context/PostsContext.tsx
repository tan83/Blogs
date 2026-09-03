import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Post } from "@/data/posts";
import { api, togglePostLike, getPostLikes } from "@/lib/api";
import { getSessionId } from "@/lib/session";

export interface PostLikesInfo {
  totalLikes: number;
  hasUserLiked: boolean;
}

interface PostsContextType {
  posts: Post[];
  loading: boolean;
  postLikes: Record<string, PostLikesInfo>;
  refresh: () => Promise<void>;
  addPost: (post: Omit<Post, "id">) => Promise<string>;
  updatePost: (id: string, updates: Partial<Post>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  getPostBySlug: (slug: string) => Post | undefined;
  getPostById: (id: string) => Post | undefined;
  toggleLike: (postId: string) => Promise<void>;
}

const PostsContext = createContext<PostsContextType>({
  posts: [],
  loading: true,
  postLikes: {},
  refresh: async () => {},
  addPost: async () => "",
  updatePost: async () => {},
  deletePost: async () => {},
  getPostBySlug: () => undefined,
  getPostById: () => undefined,
  toggleLike: async () => {},
});

export function PostsProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postLikes, setPostLikes] = useState<Record<string, PostLikesInfo>>({});

  const refresh = useCallback(async () => {
    try {
      const data = await api<Post[]>("/posts");
      setPosts(data);

      // Load likes for all posts in parallel
      const sessionId = getSessionId();
      const likesPromises = data.map((post) =>
        getPostLikes(post.id, sessionId)
          .then((likes) => ({ postId: post.id, likes }))
          .catch(() => ({ postId: post.id, likes: { totalLikes: 0, hasUserLiked: false } }))
      );

      const likesResults = await Promise.all(likesPromises);
      const likesMap: Record<string, PostLikesInfo> = {};
      likesResults.forEach(({ postId, likes }) => {
        likesMap[postId] = likes;
      });
      setPostLikes(likesMap);
    } catch (error) {
      console.error("Failed to load posts", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addPost = async (post: Omit<Post, "id">): Promise<string> => {
    const created = await api<Post>("/posts", {
      method: "POST",
      body: JSON.stringify(post),
    });
    setPosts((prev) => [created, ...prev]);
    setPostLikes((prev) => ({
      ...prev,
      [created.id]: { totalLikes: 0, hasUserLiked: false },
    }));
    return created.id;
  };

  const updatePost = async (id: string, updates: Partial<Post>) => {
    const updated = await api<Post>(`/posts/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    setPosts((prev) => prev.map((p) => (p.id === id ? updated : p)));
  };

  const deletePost = async (id: string) => {
    await api<void>(`/posts/${id}`, { method: "DELETE" });
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setPostLikes((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const toggleLike = async (postId: string) => {
    const sessionId = getSessionId();
    try {
      const result = await togglePostLike(postId, sessionId);
      setPostLikes((prev) => ({
        ...prev,
        [postId]: {
          totalLikes: result.totalLikes,
          hasUserLiked: result.hasLiked,
        },
      }));
    } catch (error) {
      console.error("Failed to toggle like", error);
      throw error;
    }
  };

  const getPostBySlug = useCallback((slug: string) => posts.find((p) => p.slug === slug), [posts]);
  const getPostById = useCallback((id: string) => posts.find((p) => p.id === id), [posts]);

  return (
    <PostsContext.Provider
      value={{
        posts,
        loading,
        postLikes,
        refresh,
        addPost,
        updatePost,
        deletePost,
        getPostBySlug,
        getPostById,
        toggleLike,
      }}
    >
      {children}
    </PostsContext.Provider>
  );
}

export const usePosts = () => useContext(PostsContext);