import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  const { projectId } = req.query;
  try {
    const tasks = await prisma.task.findMany({
      where: projectId ? { projectId: Number(projectId) } : undefined,
      include: {
        author: true,
        assignee: true,
        comments: true,
        attachments: true,
      },
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
      data: { title, description, status, priority, tags, startDate, dueDate, points, projectId: Number(projectId), authorUserId, assignedUserId },
    });
    res.status(201).json(task);
  } catch (error: any) {
    res.status(500).json({ message: "Error creating task", error: error.message });
  }
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
  const { taskId } = req.params;
  try {
    const task = await prisma.task.update({
      where: { id: Number(taskId) },
      data: req.body,
    });
    res.json(task);
  } catch (error: any) {
    res.status(500).json({ message: "Error updating task", error: error.message });
  }
};

export const updateTaskStatus = async (req: Request, res: Response): Promise<void> => {
  const { taskId } = req.params;
  const { status } = req.body;
  try {
    const task = await prisma.task.update({ where: { id: Number(taskId) }, data: { status } });
    res.json(task);
  } catch (error: any) {
    res.status(500).json({ message: "Error updating task status", error: error.message });
  }
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  const { taskId } = req.params;
  try {
    await prisma.task.delete({ where: { id: Number(taskId) } });
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: "Error deleting task", error: error.message });
  }
};
