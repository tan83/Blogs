import { Router, type Request, type Response } from "express";
import { prisma } from "../lib/prisma.js";
import { toAboutDto } from "../lib/about.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

interface AboutInput {
  name?: string;
  headline?: string;
  bio?: string;
  avatarImage?: string;
  handle?: string;
  email?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  githubUrl?: string;
  skills?: string[];
  ctaTitle?: string;
  ctaText?: string;
  ctaButtonLabel?: string;
}

interface ExperienceInput {
  role?: string;
  company?: string;
  period?: string;
  description?: string;
  order?: number;
}

function normalizeAboutBody(body: unknown): AboutInput {
  if (!body || typeof body !== "object") return {};
  const b = body as Record<string, unknown>;

  return {
    name: typeof b.name === "string" ? b.name.trim() : undefined,
    headline: typeof b.headline === "string" ? b.headline.trim() : undefined,
    bio: typeof b.bio === "string" ? b.bio : undefined,
    avatarImage: typeof b.avatarImage === "string" ? b.avatarImage : undefined,
    handle: typeof b.handle === "string" ? b.handle.trim() : undefined,
    email: typeof b.email === "string" ? b.email.trim() : undefined,
    linkedinUrl: typeof b.linkedinUrl === "string" ? b.linkedinUrl.trim() : undefined,
    twitterUrl: typeof b.twitterUrl === "string" ? b.twitterUrl.trim() : undefined,
    githubUrl: typeof b.githubUrl === "string" ? b.githubUrl.trim() : undefined,
    skills: Array.isArray(b.skills)
      ? b.skills.filter((s): s is string => typeof s === "string")
      : undefined,
    ctaTitle: typeof b.ctaTitle === "string" ? b.ctaTitle.trim() : undefined,
    ctaText: typeof b.ctaText === "string" ? b.ctaText.trim() : undefined,
    ctaButtonLabel: typeof b.ctaButtonLabel === "string" ? b.ctaButtonLabel.trim() : undefined,
  };
}

function normalizeExperienceBody(body: unknown): ExperienceInput {
  if (!body || typeof body !== "object") return {};
  const b = body as Record<string, unknown>;

  return {
    role: typeof b.role === "string" ? b.role.trim() : undefined,
    company: typeof b.company === "string" ? b.company.trim() : undefined,
    period: typeof b.period === "string" ? b.period.trim() : undefined,
    description: typeof b.description === "string" ? b.description.trim() : undefined,
    order: typeof b.order === "number" ? b.order : undefined,
  };
}

// Singleton row: creates a blank profile the first time it's needed.
async function resolveAboutId(): Promise<string> {
  const existing = await prisma.about.findFirst();
  if (existing) return existing.id;

  const created = await prisma.about.create({
    data: {
      name: "",
      headline: "",
      bio: "",
      avatarImage: "",
      handle: "",
      email: "",
      linkedinUrl: "",
      twitterUrl: "",
      githubUrl: "",
      skills: [],
      ctaTitle: "",
      ctaText: "",
      ctaButtonLabel: "",
    },
  });
  return created.id;
}

function handleNotFound(res: Response, error: unknown, message: string) {
  if (error instanceof Error && "code" in error && (error as { code: string }).code === "P2025") {
    return res.status(404).json({ message });
  }
  console.error(error);
  return res.status(500).json({ message: "Internal server error" });
}

// GET /api/about — public profile + experience
router.get("/", async (_req, res) => {
  const about = await prisma.about.findFirst({ include: { experience: true } });
  if (!about) return res.status(404).json({ message: "About profile not found" });
  res.json(toAboutDto(about));
});

// PUT /api/about — update profile fields (admin only, experience managed separately)
router.put("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const input = normalizeAboutBody(req.body);
    const id = await resolveAboutId();
    const updated = await prisma.about.update({
      where: { id },
      data: input,
      include: { experience: true },
    });
    res.json(toAboutDto(updated));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/about/experience — add an experience item (admin only)
router.post("/experience", requireAuth, async (req: Request, res: Response) => {
  try {
    const input = normalizeExperienceBody(req.body);
    if (!input.role || !input.company || !input.period || !input.description) {
      return res.status(400).json({ message: "Role, company, period and description are required" });
    }

    const aboutId = await resolveAboutId();
    const last = await prisma.experience.findFirst({
      where: { aboutId },
      orderBy: { order: "desc" },
    });

    const created = await prisma.experience.create({
      data: {
        role: input.role,
        company: input.company,
        period: input.period,
        description: input.description,
        order: input.order ?? (last ? last.order + 1 : 0),
        aboutId,
      },
    });

    res.status(201).json({
      id: created.id,
      role: created.role,
      company: created.company,
      period: created.period,
      description: created.description,
      order: created.order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// PUT /api/about/experience/:id — update one experience item (admin only)
router.put("/experience/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const input = normalizeExperienceBody(req.body);
    const updated = await prisma.experience.update({
      where: { id: req.params.id },
      data: input,
    });
    res.json({
      id: updated.id,
      role: updated.role,
      company: updated.company,
      period: updated.period,
      description: updated.description,
      order: updated.order,
    });
  } catch (error) {
    handleNotFound(res, error, "Experience item not found");
  }
});

// DELETE /api/about/experience/:id — remove one experience item (admin only)
router.delete("/experience/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    await prisma.experience.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (error) {
    handleNotFound(res, error, "Experience item not found");
  }
});

export default router;
