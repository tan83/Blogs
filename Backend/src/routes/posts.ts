import { Router, type Request, type Response } from "express";
import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { fromDateString } from "../lib/date.js";
import { toPostDto, type PostWithAuthor, type AboutForPosts } from "../lib/posts.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

type PostStatus = "published" | "draft";

interface PostInput {
  slug?: string;
  title?: string;
  excerpt?: string;
  content?: string;
  category?: string;
  tags?: string[];
  coverImage?: string;
  publishedAt?: string;
  readTime?: number;
  status?: PostStatus;
  views?: number;
  featured?: boolean;
  author?: { name?: string };
}

function normalizeBody(body: unknown): PostInput {
  if (!body || typeof body !== "object") return {};
  const b = body as Record<string, unknown>;

  return {
    slug: typeof b.slug === "string" ? b.slug.trim() : undefined,
    title: typeof b.title === "string" ? b.title.trim() : undefined,
    excerpt: typeof b.excerpt === "string" ? b.excerpt.trim() : undefined,
    content: typeof b.content === "string" ? b.content : undefined,
    category: typeof b.category === "string" ? b.category : undefined,
    tags: Array.isArray(b.tags)
      ? b.tags.filter((t): t is string => typeof t === "string")
      : undefined,
    coverImage: typeof b.coverImage === "string" ? b.coverImage : undefined,
    publishedAt:
      typeof b.publishedAt === "string" && b.publishedAt.trim() !== ""
        ? b.publishedAt
        : undefined,
    readTime: typeof b.readTime === "number" ? b.readTime : undefined,
    status:
      b.status === "published" || b.status === "draft" ? b.status : undefined,
    views: typeof b.views === "number" ? b.views : undefined,
    featured: typeof b.featured === "boolean" ? b.featured : undefined,
    author: b.author && typeof b.author === "object" ? (b.author as { name?: string }) : undefined,
  };
}

async function resolveAuthorId(supplied?: { name?: string } | null): Promise<string> {
  if (supplied?.name) {
    const found = await prisma.author.findFirst({ where: { name: supplied.name } });
    if (found) return found.id;
  }
  const fallback = await prisma.author.findFirst({ orderBy: { name: "asc" } });
  if (fallback) return fallback.id;
  throw new Error("No author configured. Run the seed first.");
}

function buildCreateData(input: PostInput, authorId: string): Prisma.PostUncheckedCreateInput {
  return {
    slug: input.slug || "",
    title: input.title || "Untitled",
    excerpt: input.excerpt ?? (input.title ? input.title : "Untitled"),
    content: input.content ?? "",
    category: input.category ?? "Personal",
    tags: input.tags ?? [],
    coverImage:
      input.coverImage ??
      "https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=1200&h=700&fit=crop&auto=format",
    publishedAt: input.publishedAt ? fromDateString(input.publishedAt) : new Date(),
    readTime: input.readTime ?? 1,
    status: input.status ?? "draft",
    views: input.views ?? 0,
    featured: input.featured ?? false,
    authorId,
  };
}

function buildUpdateData(input: PostInput): Prisma.PostUncheckedUpdateInput {
  const data: Prisma.PostUncheckedUpdateInput = {};
  if (input.slug !== undefined) data.slug = input.slug;
  if (input.title !== undefined) data.title = input.title;
  if (input.excerpt !== undefined) data.excerpt = input.excerpt;
  if (input.content !== undefined) data.content = input.content;
  if (input.category !== undefined) data.category = input.category;
  if (input.tags !== undefined) data.tags = input.tags;
  if (input.coverImage !== undefined) data.coverImage = input.coverImage;
  if (input.publishedAt !== undefined) data.publishedAt = fromDateString(input.publishedAt);
  if (input.readTime !== undefined) data.readTime = input.readTime;
  if (input.status !== undefined) data.status = input.status;
  if (input.views !== undefined) data.views = input.views;
  if (input.featured !== undefined) data.featured = input.featured;
  return data;
}

function handleError(res: Response, error: unknown) {
  if (error instanceof Error && "code" in error && (error as { code: string }).code === "P2002") {
    return res.status(409).json({ message: "A post with that slug already exists" });
  }
  console.error(error);
  return res.status(500).json({ message: "Internal server error" });
}

// List all posts (newest first)
router.get("/", async (_req, res) => {
  const [posts, about] = await Promise.all([
    prisma.post.findMany({
      include: { author: true },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    }),
    prisma.about.findFirst({ select: { avatarImage: true } }),
  ]);
  const aboutAvatar = about?.avatarImage;
  res.json(posts.map((p) => toPostDto(p, aboutAvatar)));
});

// Get a single post by id (used by the admin editor)
router.get("/id/:id", async (req, res) => {
  const [post, about] = await Promise.all([
    prisma.post.findUnique({
      where: { id: req.params.id },
      include: { author: true },
    }),
    prisma.about.findFirst({ select: { avatarImage: true } }),
  ]);
  if (!post) return res.status(404).json({ message: "Post not found" });
  res.json(toPostDto(post, about?.avatarImage));
});

// Get a single post by slug (public)
router.get("/:slug", async (req, res) => {
  const [post, about] = await Promise.all([
    prisma.post.findUnique({
      where: { slug: req.params.slug },
      include: { author: true },
    }),
    prisma.about.findFirst({ select: { avatarImage: true } }),
  ]);
  if (!post) return res.status(404).json({ message: "Post not found" });
  res.json(toPostDto(post, about?.avatarImage));
});

// Create a post (admin only)
router.post("/", requireAuth, async (req: Request, res) => {
  try {
    const input = normalizeBody(req.body);
    if (!input.slug || !input.content) {
      return res.status(400).json({ message: "Slug and content are required" });
    }
    const authorId = await resolveAuthorId(input.author);
    const created = await prisma.post.create({
      data: buildCreateData(input, authorId),
      include: { author: true },
    });
    const about = await prisma.about.findFirst({ select: { avatarImage: true } });
    res.status(201).json(toPostDto(created, about?.avatarImage));
  } catch (error) {
    handleError(res, error);
  }
});

// Update a post (admin only, partial allowed)
router.put("/:id", requireAuth, async (req: Request, res) => {
  try {
    const existing = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ message: "Post not found" });

    const input = normalizeBody(req.body);
    if (input.slug === "") {
      return res.status(400).json({ message: "Slug cannot be empty" });
    }

    const data = buildUpdateData(input);
    if (input.author?.name) {
      data.authorId = await resolveAuthorId(input.author);
    }

    const updated = await prisma.post.update({
      where: { id: req.params.id },
      data,
      include: { author: true },
    });
    const about = await prisma.about.findFirst({ select: { avatarImage: true } });
    res.json(toPostDto(updated, about?.avatarImage));
  } catch (error) {
    handleError(res, error);
  }
});

// Delete a post (admin only)
router.delete("/:id", requireAuth, async (req: Request, res) => {
  try {
    await prisma.post.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (error) {
    if (error instanceof Error && "code" in error && (error as { code: string }).code === "P2025") {
      return res.status(404).json({ message: "Post not found" });
    }
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Increment the view counter for a post
router.post("/:id/view", async (req: Request, res) => {
  try {
    const [updated, about] = await Promise.all([
      prisma.post.update({
        where: { id: req.params.id },
        data: { views: { increment: 1 } },
        include: { author: true },
      }),
      prisma.about.findFirst({ select: { avatarImage: true } }),
    ]);
    res.json(toPostDto(updated, about?.avatarImage));
  } catch (error) {
    if (error instanceof Error && "code" in error && (error as { code: string }).code === "P2025") {
      return res.status(404).json({ message: "Post not found" });
    }
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;