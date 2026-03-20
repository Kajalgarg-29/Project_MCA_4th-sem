import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getTeams = async (req: Request, res: Response) => {
  try {
    const teams = await prisma.team.findMany({
      include: { users: true },
    });
    res.json(teams);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching teams", error: error.message });
  }
};

export const createTeam = async (req: Request, res: Response) => {
  const { teamName, productOwnerUserId, projectManagerUserId } = req.body;
  try {
    const team = await prisma.team.create({
      data: {
        teamName,
        productOwnerUserId: productOwnerUserId ? Number(productOwnerUserId) : null,
        projectManagerUserId: projectManagerUserId ? Number(projectManagerUserId) : null,
      },
    });
    res.status(201).json(team);
  } catch (error: any) {
    res.status(500).json({ message: "Error creating team", error: error.message });
  }
};

export const updateTeam = async (req: Request, res: Response) => {
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
    });
    res.json(team);
  } catch (error: any) {
    res.status(500).json({ message: "Error updating team", error: error.message });
  }
};

export const deleteTeam = async (req: Request, res: Response) => {
  const { teamId } = req.params;
  try {
    await prisma.team.delete({ where: { id: Number(teamId) } });
    res.json({ message: "Team deleted" });
  } catch (error: any) {
    res.status(500).json({ message: "Error deleting team", error: error.message });
  }
};

export const addUserToTeam = async (req: Request, res: Response) => {
  const { teamId } = req.params;
  const { userId } = req.body;
  try {
    const user = await prisma.user.update({
      where: { userId: Number(userId) },
      data: { teamId: Number(teamId) },
    });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: "Error adding user to team", error: error.message });
  }
};

export const removeUserFromTeam = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const user = await prisma.user.update({
      where: { userId: Number(userId) },
      data: { teamId: null },
    });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: "Error removing user from team", error: error.message });
  }
};
