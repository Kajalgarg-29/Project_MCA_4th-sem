import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getEvents = async (req: Request, res: Response) => {
  const { month, year } = req.query;
  try {
    const where: any = {};
    if (month && year) {
      const start = new Date(Number(year), Number(month) - 1, 1);
      const end = new Date(Number(year), Number(month), 0, 23, 59, 59);
      where.date = { gte: start, lte: end };
    }
    const events = await prisma.event.findMany({ where, orderBy: { date: "asc" } });
    res.json(events);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching events", error: error.message });
  }
};

export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const events = await prisma.event.findMany({ orderBy: { date: "asc" } });
    res.json(events);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching events", error: error.message });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  const { title, description, type, date, startTime, endTime, location, attendees, color, allDay, reminder } = req.body;
  try {
    const event = await prisma.event.create({
      data: {
        title,
        description: description || null,
        type: type || "Meeting",
        date: new Date(date),
        startTime: startTime || null,
        endTime: endTime || null,
        location: location || null,
        attendees: attendees || null,
        color: color || "blue",
        allDay: allDay || false,
        reminder: reminder ? Number(reminder) : null,
      },
    });
    res.status(201).json(event);
  } catch (error: any) {
    res.status(500).json({ message: "Error creating event", error: error.message });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, type, date, startTime, endTime, location, attendees, color, allDay, reminder } = req.body;
  try {
    const event = await prisma.event.update({
      where: { id: Number(id) },
      data: {
        title,
        description: description || null,
        type,
        date: new Date(date),
        startTime: startTime || null,
        endTime: endTime || null,
        location: location || null,
        attendees: attendees || null,
        color: color || "blue",
        allDay: allDay || false,
        reminder: reminder ? Number(reminder) : null,
      },
    });
    res.json(event);
  } catch (error: any) {
    res.status(500).json({ message: "Error updating event", error: error.message });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.event.delete({ where: { id: Number(id) } });
    res.json({ message: "Event deleted" });
  } catch (error: any) {
    res.status(500).json({ message: "Error deleting event", error: error.message });
  }
};
