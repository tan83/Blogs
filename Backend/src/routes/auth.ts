import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

router.post("/login", async (req: AuthRequest, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const admin = await prisma.admin.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!admin) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const match = await bcrypt.compare(password, admin.password);
  if (!match) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ id: admin.id, email: admin.email }, JWT_SECRET, {
    expiresIn: "7d",
  });

  res.json({
    token,
    admin: { id: admin.id, email: admin.email, name: admin.name },
  });
});

router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  const admin = await prisma.admin.findUnique({ where: { id: req.admin!.id } });
  if (!admin) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
  res.json({ id: admin.id, email: admin.email, name: admin.name });
});

export default router;