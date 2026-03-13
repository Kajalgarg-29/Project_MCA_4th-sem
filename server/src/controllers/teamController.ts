import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getTeams = async (req: Request, res: Response): Promise<void> => {
  try {
    const teams = await prisma.team.findMany({
      include: { users: true, projectTeams: { include: { project: true } } },
    });
    res.json(teams);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching teams", error: error.message });
  }
};

export const createTeam = async (req: Request, res: Response): Promise<void> => {
  const { teamName, productOwnerUserId, projectManagerUserId } = req.body;
  try {
    const team = await prisma.team.create({
      data: {
        teamName,
        productOwnerUserId: productOwnerUserId ? Number(productOwnerUserId) : null,
        projectManagerUserId: projectManagerUserId ? Number(projectManagerUserId) : null,
      },
      include: { users: true, projectTeams: { include: { project: true } } },
    });
    res.status(201).json(team);
  } catch (error: any) {
    res.status(500).json({ message: "Error creating team", error: error.message });
  }
};

export const updateTeam = async (req: Request, res: Response): Promise<void> => {
  const { teamId } = req.params;
  const { teamName, productOwnerUserId, projectManagerUserId } = req.body;
  try {
    const team = await prisma.team.update({
      where: { id: Number(teamId) },
      data: {
        teamName,
        productOwnerUserId: productOwnerUserId ? Number(productOwnerUserId) : null,
        projectManagerUserId: projectManagerUserId ? Number(projectManagerUserId) : null,
      },
      include: { users: true, projectTeams: { include: { project: true } } },
    });
    res.json(team);
  } catch (error: any) {
    res.status(500).json({ message: "Error updating team", error: error.message });
  }
};

export const deleteTeam = async (req: Request, res: Response): Promise<void> => {
  const { teamId } = req.params;
  try {
    await prisma.projectTeam.deleteMany({ where: { teamId: Number(teamId) } });
    await prisma.user.updateMany({ where: { teamId: Number(teamId) }, data: { teamId: null } });
    await prisma.team.delete({ where: { id: Number(teamId) } });
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: "Error deleting team", error: error.message });
  }
};

export const addMemberToTeam = async (req: Request, res: Response): Promise<void> => {
  const { teamId } = req.params;
  const { userId } = req.body;
  try {
    const user = await prisma.user.update({
      where: { userId: Number(userId) },
      data: { teamId: Number(teamId) },
    });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: "Error adding member", error: error.message });
  }
};

export const removeMemberFromTeam = async (req: Request, res: Response): Promise<void> => {
  const { teamId, userId } = req.params;
  try {
    const user = await prisma.user.update({
      where: { userId: Number(userId) },
      data: { teamId: null },
    });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: "Error removing member", error: error.message });
  }
};

export const assignProjectToTeam = async (req: Request, res: Response): Promise<void> => {
  const { teamId } = req.params;
  const { projectId } = req.body;
  try {
    const existing = await prisma.projectTeam.findFirst({ where: { teamId: Number(teamId), projectId: Number(projectId) } });
    if (existing) { res.status(400).json({ message: "Project already assigned" }); return; }
    const pt = await prisma.projectTeam.create({ data: { teamId: Number(teamId), projectId: Number(projectId) } });
    res.status(201).json(pt);
  } catch (error: any) {
    res.status(500).json({ message: "Error assigning project", error: error.message });
  }
};

export const removeProjectFromTeam = async (req: Request, res: Response): Promise<void> => {
  const { teamId, projectId } = req.params;
  try {
    await prisma.projectTeam.deleteMany({ where: { teamId: Number(teamId), projectId: Number(projectId) } });
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: "Error removing project", error: error.message });
  }
};
