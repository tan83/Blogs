import { Router, type Request, type Response } from "express";
import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { fromDateString } from "../lib/date.js";
import { toPostDto, type PostWithAuthor, type AboutForPosts } from "../lib/posts.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
const GEMINI_RETRYABLE_STATUS_CODES = new Set([500, 502, 503, 504]);
const translationCache = new Map<string, string>();

class GeminiRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeminiRateLimitError";
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type PostStatus = "published" | "draft";

async function translateText(text: string, targetLanguage: string, sourceLanguage: string): Promise<string> {
  if (!text.trim()) return text;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key is not configured");
  }

  const cacheKey = `${GEMINI_MODEL}:${sourceLanguage}:${targetLanguage}:${text}`;
  const cachedTranslation = translationCache.get(cacheKey);
  if (cachedTranslation) return cachedTranslation;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(`${GEMINI_API_BASE_URL}/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{
                text: `You are a careful translator. Return only the translated text. Preserve markdown, structure, tone, meaning, and code blocks. Do not add explanations. If the input is a JSON object, return only valid JSON with the same keys and translated string values. Translate from ${sourceLanguage === "auto" ? "the source language" : sourceLanguage} to ${targetLanguage}.\n\n${text}`,
              }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 8192,
          },
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        const statusCode = response.status;
        if (statusCode === 429) {
          const retryMatch = errorBody.match(/retryDelay[^\d]*(\d+)s|retry in ([\d.]+)s/i);
          const retrySeconds = retryMatch?.[1] || retryMatch?.[2];
          throw new GeminiRateLimitError(
            retrySeconds
              ? `Gemini alcanzó el límite gratuito. Intenta de nuevo en ${Math.ceil(Number(retrySeconds))} segundos.`
              : "Gemini alcanzó el límite gratuito. Intenta de nuevo en un momento.",
          );
        }
        const isRetryable = GEMINI_RETRYABLE_STATUS_CODES.has(statusCode);

        if (isRetryable && attempt < 3) {
          await delay(500 * attempt);
          continue;
        }

        throw new Error(`Gemini translation failed (${statusCode}): ${errorBody}`);
      }

      const payload = (await response.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const translated = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim() ?? "";

      if (!translated) {
        throw new Error("Gemini translation response was empty");
      }

      translationCache.set(cacheKey, translated);
      return translated;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown translation error");
      if (error instanceof GeminiRateLimitError) throw error;
      if (attempt < 3) {
        await delay(500 * attempt);
      }
    }
  }

  throw lastError ?? new Error("Translation failed");
}

async function translatePostFields(
  fields: { title: string; excerpt: string; content: string },
  targetLanguage: string,
  sourceLanguage: string,
): Promise<{ title: string; excerpt: string; content: string }> {
  const translated = await translateText(
    JSON.stringify({ title: fields.title, excerpt: fields.excerpt }),
    targetLanguage,
    sourceLanguage,
  );
  const cleaned = translated.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  const normalized = firstBrace >= 0 && lastBrace > firstBrace
    ? cleaned.slice(firstBrace, lastBrace + 1)
    : cleaned;

  try {
    const parsed = JSON.parse(normalized) as Partial<typeof fields>;
    return {
      title: typeof parsed.title === "string" ? parsed.title : fields.title,
      excerpt: typeof parsed.excerpt === "string" ? parsed.excerpt : fields.excerpt,
      content: fields.content,
    };
  } catch {
    throw new Error("Gemini returned an invalid translation format");
  }
}

async function translatePostContent(
  content: string,
  targetLanguage: string,
  sourceLanguage: string,
): Promise<string> {
  if (!content) return content;

  const chunks: string[] = [];
  for (let offset = 0; offset < content.length; offset += 700) {
    chunks.push(content.slice(offset, offset + 700));
  }

  const translatedChunks: string[] = [];
  for (const chunk of chunks) {
    translatedChunks.push(await translateText(chunk, targetLanguage, sourceLanguage));
  }

  return translatedChunks.join("");
}

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
      include: { author: true, _count: { select: { likes: true } } },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    }),
    prisma.about.findFirst({ select: { avatarImage: true } }),
  ]);
  const aboutAvatar = about?.avatarImage;
  res.json(posts.map((p) => toPostDto(p, aboutAvatar)));
});

// Translate post fields using Gemini.
router.post("/translate", async (req: Request, res) => {
  try {
    const body = req.body as {
      title?: string;
      excerpt?: string;
      content?: string;
      structuredContent?: boolean;
      sourceLanguage?: string;
      targetLanguage?: string;
    };

    const sourceLanguage = body.sourceLanguage || "auto";
    const targetLanguage = body.targetLanguage || "es";

    const fields = {
      title: body.title?.trim() || "",
      excerpt: body.excerpt?.trim() || "",
      content: body.content?.trim() || "",
    };
    const translated = await translatePostFields(fields, targetLanguage, sourceLanguage);
    translated.content = body.structuredContent
      ? await translateText(fields.content, targetLanguage, sourceLanguage)
      : await translatePostContent(fields.content, targetLanguage, sourceLanguage);

    res.json({ ...translated, sourceLanguage, targetLanguage });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Translation failed";
    console.error("Post translation failed:", error);
    res.status(error instanceof GeminiRateLimitError ? 429 : 500).json({ message });
  }
});

// Get a single post by id (used by the admin editor)
router.get("/id/:id", async (req, res) => {
  const [post, about] = await Promise.all([
    prisma.post.findUnique({
      where: { id: req.params.id },
      include: { author: true, _count: { select: { likes: true } } },
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
      include: { author: true, _count: { select: { likes: true } } },
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
      include: { author: true, _count: { select: { likes: true } } },
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
      include: { author: true, _count: { select: { likes: true } } },
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
        include: { author: true, _count: { select: { likes: true } } },
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

// Toggle like for a post (anonymous users via sessionId)
router.post("/:id/like", async (req: Request, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId || typeof sessionId !== "string" || sessionId.trim() === "") {
      return res.status(400).json({ message: "sessionId is required" });
    }

    const postExists = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!postExists) return res.status(404).json({ message: "Post not found" });

    // Check if like already exists
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_sessionId: { postId: req.params.id, sessionId },
      },
    });

    let hasLiked: boolean;
    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
      hasLiked = false;
    } else {
      // Like
      await prisma.like.create({
        data: {
          postId: req.params.id,
          sessionId,
        },
      });
      hasLiked = true;
    }

    // Get total likes
    const totalLikes = await prisma.like.count({
      where: { postId: req.params.id },
    });

    res.json({ hasLiked, totalLikes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get like info for a post
router.get("/:id/likes", async (req: Request, res) => {
  try {
    const sessionId = req.query.sessionId as string | undefined;
    if (!sessionId || sessionId.trim() === "") {
      return res.status(400).json({ message: "sessionId query parameter is required" });
    }

    const postExists = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!postExists) return res.status(404).json({ message: "Post not found" });

    const [totalLikes, userLike] = await Promise.all([
      prisma.like.count({
        where: { postId: req.params.id },
      }),
      prisma.like.findUnique({
        where: {
          postId_sessionId: { postId: req.params.id, sessionId },
        },
      }),
    ]);

    res.json({
      totalLikes,
      hasUserLiked: userLike !== null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;