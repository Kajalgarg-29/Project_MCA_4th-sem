"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const search = async (req, res) => {
    const { query } = req.query;
    try {
        const tasks = await prisma.task.findMany({
            where: {
                OR: [
                    { title: { contains: String(query), mode: "insensitive" } },
                    { description: { contains: String(query), mode: "insensitive" } },
                ],
            },
        });
        const projects = await prisma.project.findMany({
            where: {
                OR: [
                    { name: { contains: String(query), mode: "insensitive" } },
                    { description: { contains: String(query), mode: "insensitive" } },
                ],
            },
        });
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { username: { contains: String(query), mode: "insensitive" } },
                    { email: { contains: String(query), mode: "insensitive" } },
                ],
            },
        });
        res.json({ tasks, projects, users });
    }
    catch (error) {
        res.status(500).json({ message: "Error performing search" });
    }
};
exports.search = search;
