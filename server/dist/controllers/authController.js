"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRole = exports.googleSignIn = exports.getMe = exports.login = exports.register = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey123";
// ─────────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────────
const register = async (req, res) => {
    const { username, email, password, role } = req.body;
    try {
        const existingEmail = await prisma.user.findUnique({ where: { email } });
        if (existingEmail)
            return res.status(400).json({ message: "Email already exists" });
        const existingUsername = await prisma.user.findUnique({ where: { username } });
        if (existingUsername)
            return res.status(400).json({ message: "Username already exists" });
        const hashed = await bcryptjs_1.default.hash(password, 10);
        // First user ever → auto Admin, otherwise use provided role or default Member
        const userCount = await prisma.user.count();
        const userRole = userCount === 0 ? "Admin" : (role || "Member");
        const user = await prisma.user.create({
            data: { username, email, password: hashed, role: userRole },
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.userId, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
        res.status(201).json({
            token,
            user: {
                userId: user.userId,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error registering user" });
    }
};
exports.register = register;
// ─────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user)
            return res.status(400).json({ message: "Invalid email or password" });
        const valid = await bcryptjs_1.default.compare(password, user.password);
        if (!valid)
            return res.status(400).json({ message: "Invalid email or password" });
        const token = jsonwebtoken_1.default.sign({ userId: user.userId, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
        res.json({
            token,
            user: {
                userId: user.userId,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error logging in" });
    }
};
exports.login = login;
// ─────────────────────────────────────────────
// GET ME (from token)
// ─────────────────────────────────────────────
const getMe = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader)
        return res.status(401).json({ message: "No token" });
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: { userId: decoded.userId },
        });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        res.json({
            userId: user.userId,
            username: user.username,
            email: user.email,
            role: user.role,
        });
    }
    catch {
        res.status(401).json({ message: "Invalid token" });
    }
};
exports.getMe = getMe;
// ─────────────────────────────────────────────
// GOOGLE SIGN IN
// ─────────────────────────────────────────────
const googleSignIn = async (req, res) => {
    const { email, username, googleId } = req.body;
    try {
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            let finalUsername = username || email.split("@")[0];
            const existingUsername = await prisma.user.findUnique({
                where: { username: finalUsername },
            });
            if (existingUsername)
                finalUsername = finalUsername + "_" + Date.now();
            // First user ever → auto Admin
            const userCount = await prisma.user.count();
            const role = userCount === 0 ? "Admin" : "Member";
            user = await prisma.user.create({
                data: {
                    email,
                    username: finalUsername,
                    password: `google_${googleId}`,
                    role,
                },
            });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.userId, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
        res.json({
            token,
            user: {
                userId: user.userId,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error with Google sign in" });
    }
};
exports.googleSignIn = googleSignIn;
// ─────────────────────────────────────────────
// UPDATE ROLE — Admin only
// ✅ FIX: now validates caller is Admin before allowing role change
// ─────────────────────────────────────────────
const updateRole = async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;
    // ✅ Validate the role value is one of the allowed roles
    const allowedRoles = ["Admin", "Manager", "Member"];
    if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role. Must be Admin, Manager, or Member" });
    }
    // ✅ Verify the caller has a valid token and is an Admin
    const authHeader = req.headers.authorization;
    if (!authHeader)
        return res.status(401).json({ message: "No token provided" });
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (decoded.role?.toLowerCase() !== "admin") {
            return res.status(403).json({ message: "Admin access required to change roles" });
        }
    }
    catch {
        return res.status(401).json({ message: "Invalid token" });
    }
    try {
        const user = await prisma.user.update({
            where: { userId: Number(userId) },
            data: { role },
        });
        res.json({
            userId: user.userId,
            username: user.username,
            email: user.email,
            role: user.role,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error updating role" });
    }
};
exports.updateRole = updateRole;
