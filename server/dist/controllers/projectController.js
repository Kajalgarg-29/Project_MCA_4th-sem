"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProject = exports.createProject = exports.getProjects = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getProjects = async (req, res) => {
    try {
        const userId = req.userId;
        const role = req.userRole;
        // Admin and Manager see all projects
        // Member sees only their own projects
        const where = role === "Member" ? { createdBy: userId } : {};
        const projects = await prisma.project.findMany({
            where,
            include: {
                owner: { select: { userId: true, username: true, email: true } },
            },
            orderBy: { id: "desc" },
        });
        res.json(projects);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Error fetching projects", error: error.message });
    }
};
exports.getProjects = getProjects;
const createProject = async (req, res) => {
    const { name, description, startDate, endDate } = req.body;
    try {
        const project = await prisma.project.create({
            data: {
                name,
                description: description || null,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                createdBy: req.userId || null,
            },
        });
        res.status(201).json(project);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Error creating project", error: error.message });
    }
};
exports.createProject = createProject;
const deleteProject = async (req, res) => {
    const { projectId } = req.params;
    try {
        const project = await prisma.project.findUnique({
            where: { id: Number(projectId) },
        });
        if (!project)
            return res.status(404).json({ message: "Project not found" });
        // Only owner or Admin can delete
        if (req.userRole !== "Admin" && project.createdBy !== req.userId) {
            return res
                .status(403)
                .json({ message: "Not authorized to delete this project" });
        }
        await prisma.task.deleteMany({ where: { projectId: Number(projectId) } });
        await prisma.project.delete({ where: { id: Number(projectId) } });
        res.json({ message: "Project deleted" });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Error deleting project", error: error.message });
    }
};
exports.deleteProject = deleteProject;
