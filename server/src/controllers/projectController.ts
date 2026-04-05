import { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { AuthRequest } from "../middleware/auth";

const prisma = new PrismaClient();

export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const role = req.userRole;

    // Admin and Manager see all projects
    // Member sees only their own projects
const where: Prisma.ProjectWhereInput =
  role === "Member" && userId ? { createdBy: userId } : {};

    const projects = await prisma.project.findMany({
      where,
      include: { owner: { select: { userId: true, username: true, email: true } } },
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
        createdBy: req.userId ?? null,
      },
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
      select: {
        id: true,
        name: true,
        description: true,
        startDate: true,
        endDate: true,
        createdBy: true,
      },
    });
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Only owner or Admin can delete
if (req.userRole !== "Admin" && project.createdBy !== (req.userId ?? null)) {  
      return res.status(403).json({ message: "Not authorized to delete this project" });
    }

    await prisma.task.deleteMany({ where: { projectId: Number(projectId) } });
    await prisma.project.delete({ where: { id: Number(projectId) } });
    res.json({ message: "Project deleted" });
  } catch (error: any) {
    res.status(500).json({ message: "Error deleting project", error: error.message });
  }
};