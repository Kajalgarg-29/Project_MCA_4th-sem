import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: { team: true },
      omit: { password: true },
    });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};

export const createUser = async (req: Request, res: Response) => {
  // ✅ FIX 1: role is now extracted from body
  const { username, email, password, role } = req.body;
  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email and password are required" });
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) return res.status(400).json({ message: "Email already exists" });

    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) return res.status(400).json({ message: "Username already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      // ✅ FIX 1: role is now saved — defaults to "Member" if not provided
      data: { username, email, password: hashed, role: role || "Member" },
    });

    res.status(201).json({
      userId: user.userId,
      username: user.username,
      email: user.email,
      role: user.role, // ✅ role returned in response so frontend reflects it immediately
    });
  } catch (error: any) {
    res.status(500).json({ message: "Error creating user", error: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  // ✅ FIX 2: role is now extracted from body
  const { username, email, profilePictureUrl, role } = req.body;
  try {
    const user = await prisma.user.update({
      where: { userId: Number(userId) },
      data: {
        username,
        email,
        profilePictureUrl,
        // ✅ FIX 2: role is only updated if provided, won't overwrite existing role otherwise
        ...(role && { role }),
      },
    });

    res.json({
      userId: user.userId,
      username: user.username,
      email: user.email,
      role: user.role, // ✅ role returned so frontend stays in sync
    });
  } catch (error: any) {
    res.status(500).json({ message: "Error updating user", error: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    await prisma.user.delete({ where: { userId: Number(userId) } });
    res.json({ message: "User deleted" });
  } catch (error: any) {
    res.status(500).json({ message: "Error deleting user", error: error.message });
  }
};