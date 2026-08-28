import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Post } from "@/data/posts";
import { api } from "@/lib/api";

interface PostsContextType {
  posts: Post[];
  loading: boolean;
  refresh: () => Promise<void>;
  addPost: (post: Omit<Post, "id">) => Promise<string>;
  updatePost: (id: string, updates: Partial<Post>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  getPostBySlug: (slug: string) => Post | undefined;
  getPostById: (id: string) => Post | undefined;
}

const PostsContext = createContext<PostsContextType>({
  posts: [],
  loading: true,
  refresh: async () => {},
  addPost: async () => "",
  updatePost: async () => {},
  deletePost: async () => {},
  getPostBySlug: () => undefined,
  getPostById: () => undefined,
});

export function PostsProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await api<Post[]>("/posts");
      setPosts(data);
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
  };

  const getPostBySlug = useCallback((slug: string) => posts.find((p) => p.slug === slug), [posts]);
  const getPostById = useCallback((id: string) => posts.find((p) => p.id === id), [posts]);

  return (
    <PostsContext.Provider
      value={{ posts, loading, refresh, addPost, updatePost, deletePost, getPostBySlug, getPostById }}
    >
      {children}
    </PostsContext.Provider>
  );
}

export const usePosts = () => useContext(PostsContext);