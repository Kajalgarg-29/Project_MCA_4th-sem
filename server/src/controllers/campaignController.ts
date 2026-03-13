import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getCampaigns = async (req: Request, res: Response) => {
  try {
    const campaigns = await prisma.campaign.findMany({ orderBy: { createdAt: "desc" } });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: "Error fetching campaigns" });
  }
};

export const createCampaign = async (req: Request, res: Response) => {
  const { name, type, platform, budget, startDate, endDate, goal, status, targetAge, targetLocation, targetIndustry, projectId } = req.body;
  try {
    const campaign = await prisma.campaign.create({
      data: {
        name, type, platform,
        budget: parseFloat(budget),
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        goal: goal || null,
        status: status || "Draft",
        targetAge: targetAge || null,
        targetLocation: targetLocation || null,
        targetIndustry: targetIndustry || null,
        projectId: projectId ? Number(projectId) : null,
      },
    });
    res.status(201).json(campaign);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating campaign" });
  }
};

export const updateCampaign = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, type, platform, budget, startDate, endDate, goal, status, targetAge, targetLocation, targetIndustry, clicks, leads, conversions, impressions } = req.body;
  try {
    const campaign = await prisma.campaign.update({
      where: { id: Number(id) },
      data: {
        name, type, platform,
        budget: budget ? parseFloat(budget) : undefined,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        goal: goal || null,
        status,
        targetAge: targetAge || null,
        targetLocation: targetLocation || null,
        targetIndustry: targetIndustry || null,
        clicks: clicks !== undefined ? Number(clicks) : undefined,
        leads: leads !== undefined ? Number(leads) : undefined,
        conversions: conversions !== undefined ? Number(conversions) : undefined,
        impressions: impressions !== undefined ? Number(impressions) : undefined,
      },
    });
    res.json(campaign);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating campaign" });
  }
};

export const deleteCampaign = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.campaign.delete({ where: { id: Number(id) } });
    res.json({ message: "Campaign deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting campaign" });
  }
};
