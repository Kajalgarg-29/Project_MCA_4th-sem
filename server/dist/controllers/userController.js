"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUsers = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            include: { team: true },
            omit: { password: true },
        });
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching users", error: error.message });
    }
};
exports.getUsers = getUsers;
const createUser = async (req, res) => {
    // ✅ FIX 1: role is now extracted from body
    const { username, email, password, role } = req.body;
    try {
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Username, email and password are required" });
        }
        const existingEmail = await prisma.user.findUnique({ where: { email } });
        if (existingEmail)
            return res.status(400).json({ message: "Email already exists" });
        const existingUsername = await prisma.user.findUnique({ where: { username } });
        if (existingUsername)
            return res.status(400).json({ message: "Username already exists" });
        const hashed = await bcryptjs_1.default.hash(password, 10);
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
    }
    catch (error) {
        res.status(500).json({ message: "Error creating user", error: error.message });
    }
};
exports.createUser = createUser;
const updateUser = async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ message: "Error updating user", error: error.message });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    const { userId } = req.params;
    try {
        await prisma.user.delete({ where: { userId: Number(userId) } });
        res.json({ message: "User deleted" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting user", error: error.message });
    }
};
exports.deleteUser = deleteUser;
