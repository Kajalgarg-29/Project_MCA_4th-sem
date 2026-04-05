import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey123";

export interface AuthRequest extends Request {
  userId?: number;
  userRole?: string;
  userEmail?: string;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    req.userEmail = decoded.email;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.userRole !== "Admin") return res.status(403).json({ message: "Admin access required" });
  next();
};

export const requireManagerOrAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!["Admin", "Manager"].includes(req.userRole || "")) {
    return res.status(403).json({ message: "Manager or Admin access required" });
  }
  next();
};
