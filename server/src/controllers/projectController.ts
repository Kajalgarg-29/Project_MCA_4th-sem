import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/auth";

const prisma = new PrismaClient();

export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const role = req.userRole;

    const projects = await prisma.project.findMany({
      where: role === "Member" ? { createdBy: userId } : undefined,
      orderBy: { id: "desc" },
    });
    res.json(projects);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching projects", error: error.message });
  }
};

export const createProject = async (req: AuthRequest, res: Response) => {
  const { name, description, startDate, endDate } = req.body;
  try {
    const project = await prisma.project.create({
      data: {
        name,
        description: description || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        createdBy: req.userId || null,
      } as any,
    });
    res.status(201).json(project);
  } catch (error: any) {
    res.status(500).json({ message: "Error creating project", error: error.message });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response) => {
  const { projectId } = req.params;
  try {
    const project = await prisma.project.findUnique({
      where: { id: Number(projectId) },
    }) as any;

    if (!project) return res.status(404).json({ message: "Project not found" });

    if (req.userRole !== "Admin" && project.createdBy !== req.userId) {
      return res.status(403).json({ message: "Not authorized to delete this project" });
    }

    await prisma.task.deleteMany({ where: { projectId: Number(projectId) } });
    await prisma.project.delete({ where: { id: Number(projectId) } });
    res.json({ message: "Project deleted" });
  } catch (error: any) {
    res.status(500).json({ message: "Error deleting project", error: error.message });
  }
};
