import type { Prisma } from "@prisma/client";
import { toDateString } from "./date.js";

export type PostWithAuthor = Prisma.PostGetPayload<{
  include: { author: true };
}>;

export function toPostDto(post: PostWithAuthor) {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    category: post.category,
    tags: post.tags,
    coverImage: post.coverImage,
    publishedAt: toDateString(post.publishedAt),
    readTime: post.readTime,
    status: post.status,
    views: post.views,
    featured: post.featured,
    author: {
      name: post.author.name,
      avatar: post.author.avatar,
      bio: post.author.bio,
      twitter: post.author.twitter,
    },
  };
}