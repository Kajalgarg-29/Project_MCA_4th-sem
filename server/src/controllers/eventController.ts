import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/auth";

const prisma = new PrismaClient();

export const getEvents = async (req: AuthRequest, res: Response) => {
  const { month, year } = req.query;
  try {
    const where: any = { createdBy: req.userId };
    if (month && year) {
      where.date = {
        gte: new Date(Number(year), Number(month) - 1, 1),
        lte: new Date(Number(year), Number(month), 0, 23, 59, 59),
      };
    }
    const events = await prisma.event.findMany({ where, orderBy: { date: "asc" } });
    res.json(events);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching events", error: error.message });
  }
};

export const getAllEvents = async (req: AuthRequest, res: Response) => {
  try {
    const events = await prisma.event.findMany({
      where: { createdBy: req.userId },
      orderBy: { date: "asc" },
    });
    res.json(events);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching events", error: error.message });
  }
};

export const createEvent = async (req: AuthRequest, res: Response) => {
  const { title, description, type, date, startTime, endTime, location, attendees, color, allDay, reminder } = req.body;
  try {
    const event = await prisma.event.create({
      data: {
        title, description: description || null,
        type: type || "Meeting", date: new Date(date),
        startTime: startTime || null, endTime: endTime || null,
        location: location || null, attendees: attendees || null,
        color: color || "blue", allDay: allDay || false,
        reminder: reminder ? Number(reminder) : null,
        createdBy: req.userId || null,
      },
    });
    res.status(201).json(event);
  } catch (error: any) {
    res.status(500).json({ message: "Error creating event", error: error.message });
  }
};

export const updateEvent = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, description, type, date, startTime, endTime, location, attendees, color, allDay, reminder } = req.body;
  try {
    const event = await prisma.event.findUnique({ where: { id: Number(id) } });
    if (!event) return res.status(404).json({ message: "Not found" });
    if (event.createdBy !== req.userId) return res.status(403).json({ message: "Access denied" });
    const updated = await prisma.event.update({
      where: { id: Number(id) },
      data: {
        title, description: description || null, type,
        date: new Date(date), startTime: startTime || null,
        endTime: endTime || null, location: location || null,
        attendees: attendees || null, color: color || "blue",
        allDay: allDay || false,
        reminder: reminder ? Number(reminder) : null,
      },
    });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: "Error updating event", error: error.message });
  }
};

export const deleteEvent = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const event = await prisma.event.findUnique({ where: { id: Number(id) } });
    if (!event) return res.status(404).json({ message: "Not found" });
    if (event.createdBy !== req.userId) return res.status(403).json({ message: "Access denied" });
    await prisma.event.delete({ where: { id: Number(id) } });
    res.json({ message: "Event deleted" });
  } catch (error: any) {
    res.status(500).json({ message: "Error deleting event", error: error.message });
  }
};
