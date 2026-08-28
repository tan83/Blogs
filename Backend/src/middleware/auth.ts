import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export interface AuthRequest extends Request {
  admin?: { id: string; email: string };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as {
      id: string;
      email: string;
    };
    req.admin = payload;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}