"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireManagerOrAdmin = exports.requireAdmin = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey123";
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader)
        return res.status(401).json({ message: "No token provided" });
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        req.userEmail = decoded.email;
        next();
    }
    catch {
        return res.status(401).json({ message: "Invalid token" });
    }
};
exports.authenticate = authenticate;
const requireAdmin = (req, res, next) => {
    if (req.userRole !== "Admin")
        return res.status(403).json({ message: "Admin access required" });
    next();
};
exports.requireAdmin = requireAdmin;
const requireManagerOrAdmin = (req, res, next) => {
    if (!["Admin", "Manager"].includes(req.userRole || "")) {
        return res.status(403).json({ message: "Manager or Admin access required" });
    }
    next();
};
exports.requireManagerOrAdmin = requireManagerOrAdmin;
