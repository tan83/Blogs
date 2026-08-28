import { Router, type Request, type Response } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BASE64_LENGTH = 6 * 1024 * 1024;

function parseImageData(raw: unknown): { mimeType: string; base64: string } | null {
  if (typeof raw !== "string" || raw.trim() === "") return null;

  if (raw.startsWith("data:")) {
    const match = raw.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) return null;
    return { mimeType: match[1].toLowerCase(), base64: match[2] };
  }

  return { mimeType: "image/png", base64: raw };
}

// Upload an image, stored in the database as base64
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const body = (req.body ?? {}) as { data?: unknown; mimeType?: unknown };
    const parsed = parseImageData(body.data);
    if (!parsed) {
      return res.status(400).json({ message: "Image data is required" });
    }

    const mimeType =
      typeof body.mimeType === "string" && ALLOWED_MIME.has(body.mimeType)
        ? body.mimeType
        : parsed.mimeType;

    if (!ALLOWED_MIME.has(mimeType)) {
      return res.status(400).json({ message: "Unsupported image type" });
    }
    if (parsed.base64.length > MAX_BASE64_LENGTH) {
      return res.status(400).json({ message: "Image is too large (max 4.5 MB)" });
    }

    const decoded = Buffer.from(parsed.base64, "base64");
    if (decoded.length === 0) {
      return res.status(400).json({ message: "Image data is empty" });
    }
    if (decoded.length > 4.5 * 1024 * 1024) {
      return res.status(400).json({ message: "Image is too large (max 4.5 MB)" });
    }

    const image = await prisma.image.create({ data: { mimeType, base64: parsed.base64 } });

    res.status(201).json({
      id: image.id,
      url: `/api/images/${image.id}`,
      mimeType: image.mimeType,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Serve the stored image bytes (public)
router.get("/:id", async (req: Request, res: Response) => {
  const image = await prisma.image.findUnique({ where: { id: req.params.id } });
  if (!image) return res.status(404).json({ message: "Image not found" });

  const data = Buffer.from(image.base64, "base64");
  res.setHeader("Content-Type", image.mimeType);
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  res.send(data);
});

export default router;