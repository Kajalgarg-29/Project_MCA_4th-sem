"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.updateTaskStatus = exports.createTask = exports.getTasks = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getTasks = async (req, res) => {
    const { projectId } = req.query;
    try {
        const tasks = await prisma.task.findMany({
            where: { projectId: Number(projectId) },
            include: { author: true, assignee: true },
        });
        res.json(tasks);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching tasks", error: error.message });
    }
};
exports.getTasks = getTasks;
const createTask = async (req, res) => {
    const { title, description, status, priority, tags, startDate, dueDate, points, projectId, authorUserId, assignedUserId } = req.body;
    try {
        const task = await prisma.task.create({
            data: {
                title,
                description: description || null,
                status: status || "To Do",
                priority: priority || null,
                tags: tags || null,
                startDate: startDate ? new Date(startDate) : null,
                dueDate: dueDate && dueDate !== "" ? new Date(dueDate) : null,
                points: points ? Number(points) : null,
                projectId: Number(projectId),
                authorUserId: authorUserId ? Number(authorUserId) : null,
                assignedUserId: assignedUserId ? Number(assignedUserId) : null,
            },
        });
        res.status(201).json(task);
    }
    catch (error) {
        res.status(500).json({ message: "Error creating task", error: error.message });
    }
};
exports.createTask = createTask;
const updateTaskStatus = async (req, res) => {
    const { taskId } = req.params;
    const { status } = req.body;
    try {
        const task = await prisma.task.update({
            where: { id: Number(taskId) },
            data: { status },
        });
        res.json(task);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating task status", error: error.message });
    }
};
exports.updateTaskStatus = updateTaskStatus;
const deleteTask = async (req, res) => {
    const { taskId } = req.params;
    try {
        await prisma.task.delete({ where: { id: Number(taskId) } });
        res.json({ message: "Task deleted" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting task", error: error.message });
    }
};
exports.deleteTask = deleteTask;
