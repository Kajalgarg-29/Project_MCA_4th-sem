import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getProjects = async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany();
    res.json(projects);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching projects", error: error.message });
  }
};

export const createProject = async (req: Request, res: Response) => {
  const { name, description, startDate, endDate } = req.body;
  try {
    const project = await prisma.project.create({
      data: {
        name,
        description: description || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });
    res.status(201).json(project);
  } catch (error: any) {
    res.status(500).json({ message: "Error creating project", error: error.message });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  try {
    // Delete all tasks first
    await prisma.task.deleteMany({ where: { projectId: Number(projectId) } });
    await prisma.project.delete({ where: { id: Number(projectId) } });
    res.json({ message: "Project deleted" });
  } catch (error: any) {
    res.status(500).json({ message: "Error deleting project", error: error.message });
  }
};
