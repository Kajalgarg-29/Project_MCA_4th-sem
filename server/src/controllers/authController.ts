import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey123";

export const register = async (req: Request, res: Response) => {
  const { username, email, password, role } = req.body;
  try {
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) return res.status(400).json({ message: "Email already exists" });
    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) return res.status(400).json({ message: "Username already exists" });
    const hashed = await bcrypt.hash(password, 10);
    const userCount = await prisma.user.count();
    const userRole = userCount === 0 ? "Admin" : (role || "Member");
    const user = await prisma.user.create({
      data: { username, email, password: hashed, role: userRole },
    });
    const token = jwt.sign({ userId: user.userId, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, user: { userId: user.userId, username: user.username, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: "Error registering user" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid email or password" });
    const token = jwt.sign({ userId: user.userId, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { userId: user.userId, username: user.username, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: "Error logging in" });
  }
};

export const getMe = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await prisma.user.findUnique({ where: { userId: decoded.userId } });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ userId: user.userId, username: user.username, email: user.email, role: user.role });
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const googleSignIn = async (req: Request, res: Response) => {
  const { email, username, googleId } = req.body;
  try {
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      let finalUsername = username || email.split("@")[0];
      const existingUsername = await prisma.user.findUnique({ where: { username: finalUsername } });
      if (existingUsername) finalUsername = finalUsername + "_" + Date.now();
      const userCount = await prisma.user.count();
      const role = userCount === 0 ? "Admin" : "Member";
      user = await prisma.user.create({
        data: { email, username: finalUsername, password: `google_${googleId}`, role },
      });
    }
    const token = jwt.sign({ userId: user.userId, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { userId: user.userId, username: user.username, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: "Error with Google sign in" });
  }
};

export const updateRole = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { role } = req.body;
  try {
    const user = await prisma.user.update({
      where: { userId: Number(userId) },
      data: { role },
    });
    res.json({ userId: user.userId, username: user.username, email: user.email, role: user.role });
  } catch (error) {
    res.status(500).json({ message: "Error updating role" });
  }
};
