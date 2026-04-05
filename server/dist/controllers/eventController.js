"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEvent = exports.updateEvent = exports.createEvent = exports.getAllEvents = exports.getEvents = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getEvents = async (req, res) => {
    const { month, year } = req.query;
    try {
        const where = { createdBy: req.userId };
        if (month && year) {
            where.date = {
                gte: new Date(Number(year), Number(month) - 1, 1),
                lte: new Date(Number(year), Number(month), 0, 23, 59, 59),
            };
        }
        const events = await prisma.event.findMany({ where, orderBy: { date: "asc" } });
        res.json(events);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching events", error: error.message });
    }
};
exports.getEvents = getEvents;
const getAllEvents = async (req, res) => {
    try {
        const events = await prisma.event.findMany({
            where: { createdBy: req.userId },
            orderBy: { date: "asc" },
        });
        res.json(events);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching events", error: error.message });
    }
};
exports.getAllEvents = getAllEvents;
const createEvent = async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ message: "Error creating event", error: error.message });
    }
};
exports.createEvent = createEvent;
const updateEvent = async (req, res) => {
    const { id } = req.params;
    const { title, description, type, date, startTime, endTime, location, attendees, color, allDay, reminder } = req.body;
    try {
        const event = await prisma.event.findUnique({ where: { id: Number(id) } });
        if (!event)
            return res.status(404).json({ message: "Not found" });
        if (event.createdBy !== req.userId)
            return res.status(403).json({ message: "Access denied" });
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
    }
    catch (error) {
        res.status(500).json({ message: "Error updating event", error: error.message });
    }
};
exports.updateEvent = updateEvent;
const deleteEvent = async (req, res) => {
    const { id } = req.params;
    try {
        const event = await prisma.event.findUnique({ where: { id: Number(id) } });
        if (!event)
            return res.status(404).json({ message: "Not found" });
        if (event.createdBy !== req.userId)
            return res.status(403).json({ message: "Access denied" });
        await prisma.event.delete({ where: { id: Number(id) } });
        res.json({ message: "Event deleted" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting event", error: error.message });
    }
};
exports.deleteEvent = deleteEvent;
