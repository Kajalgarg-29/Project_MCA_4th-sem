import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  const { projectId } = req.query;
  try {
    const tasks = await prisma.task.findMany({
      where: { projectId: Number(projectId) },
      include: { author: true, assignee: true },
    });
    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching tasks", error: error.message });
  }
};

export const createTask = async (req: Request, res: Response): Promise<void> => {
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
  } catch (error: any) {
    res.status(500).json({ message: "Error creating task", error: error.message });
  }
};

export const updateTaskStatus = async (req: Request, res: Response): Promise<void> => {
  const { taskId } = req.params;
  const { status } = req.body;
  try {
    const task = await prisma.task.update({
      where: { id: Number(taskId) },
      data: { status },
    });
    res.json(task);
  } catch (error: any) {
    res.status(500).json({ message: "Error updating task status", error: error.message });
  }
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  const { taskId } = req.params;
  try {
    await prisma.task.delete({ where: { id: Number(taskId) } });
    res.json({ message: "Task deleted" });
  } catch (error: any) {
    res.status(500).json({ message: "Error deleting task", error: error.message });
  }
};
