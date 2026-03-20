import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getCampaigns = async (req: Request, res: Response) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(campaigns);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching campaigns", error: error.message });
  }
};

export const getCampaign = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const campaign = await prisma.campaign.findUnique({ where: { id: Number(id) } });
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });
    res.json(campaign);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching campaign", error: error.message });
  }
};

export const createCampaign = async (req: Request, res: Response) => {
  const { name, description, status, type, budget, startDate, endDate, target, reach, clicks, conversions } = req.body;
  try {
    const campaign = await prisma.campaign.create({
      data: {
        name,
        description: description || null,
        status: status || "Draft",
        type: type || "Social Media",
        budget: budget ? Number(budget) : null,
        spent: 0,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        target: target || null,
        reach: reach ? Number(reach) : 0,
        clicks: clicks ? Number(clicks) : 0,
        conversions: conversions ? Number(conversions) : 0,
      },
    });
    res.status(201).json(campaign);
  } catch (error: any) {
    res.status(500).json({ message: "Error creating campaign", error: error.message });
  }
};

export const updateCampaign = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, status, type, budget, spent, startDate, endDate, target, reach, clicks, conversions } = req.body;
  try {
    const campaign = await prisma.campaign.update({
      where: { id: Number(id) },
      data: {
        name,
        description: description || null,
        status,
        type,
        budget: budget ? Number(budget) : null,
        spent: spent ? Number(spent) : 0,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        target: target || null,
        reach: reach ? Number(reach) : 0,
        clicks: clicks ? Number(clicks) : 0,
        conversions: conversions ? Number(conversions) : 0,
      },
    });
    res.json(campaign);
  } catch (error: any) {
    res.status(500).json({ message: "Error updating campaign", error: error.message });
  }
};

export const deleteCampaign = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.campaign.delete({ where: { id: Number(id) } });
    res.json({ message: "Campaign deleted" });
  } catch (error: any) {
    res.status(500).json({ message: "Error deleting campaign", error: error.message });
  }
};
