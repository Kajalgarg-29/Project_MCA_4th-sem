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
  const { username, email, password } = req.body;
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
      data: { username, email, password: hashed },
    });
    res.status(201).json({ userId: user.userId, username: user.username, email: user.email });
  } catch (error: any) {
    res.status(500).json({ message: "Error creating user", error: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { username, email, profilePictureUrl } = req.body;
  try {
    const user = await prisma.user.update({
      where: { userId: Number(userId) },
      data: { username, email, profilePictureUrl },
    });
    res.json({ userId: user.userId, username: user.username, email: user.email });
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
