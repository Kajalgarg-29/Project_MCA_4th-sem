import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAttendance = async (req: Request, res: Response) => {
  const { userId, date, month, year } = req.query;
  try {
    const where: any = {};
    if (userId) where.userId = Number(userId);
    if (month && year) {
      const start = new Date(Number(year), Number(month) - 1, 1);
      const end = new Date(Number(year), Number(month), 0, 23, 59, 59);
      where.date = { gte: start, lte: end };
    }
    const attendance = await prisma.attendance.findMany({
      where,
      include: { user: { select: { userId: true, username: true, email: true } } },
      orderBy: { date: "desc" },
    });
    res.json(attendance);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching attendance", error: error.message });
  }
};

export const getTodayAttendance = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    const attendance = await prisma.attendance.findMany({
      where: { date: { gte: start, lte: end } },
      include: { user: { select: { userId: true, username: true, email: true } } },
      orderBy: { checkIn: "asc" },
    });
    res.json(attendance);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching today attendance", error: error.message });
  }
};

export const checkIn = async (req: Request, res: Response) => {
  const { userId, notes, status } = req.body;
  try {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const existing = await prisma.attendance.findFirst({
      where: { userId: Number(userId), date: { gte: start, lte: end } },
    });

    if (existing) {
      return res.status(400).json({ message: "Already checked in today" });
    }

    const now = new Date();
    const nineAM = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0, 0);
    const autoStatus = status || (now > nineAM ? "Late" : "Present");

    const attendance = await prisma.attendance.create({
      data: {
        userId: Number(userId),
        date: now,
        checkIn: now,
        status: autoStatus,
        notes: notes || null,
      },
      include: { user: { select: { userId: true, username: true, email: true } } },
    });
    res.status(201).json(attendance);
  } catch (error: any) {
    res.status(500).json({ message: "Error checking in", error: error.message });
  }
};

export const checkOut = async (req: Request, res: Response) => {
  const { attendanceId } = req.params;
  try {
    const record = await prisma.attendance.findUnique({ where: { id: Number(attendanceId) } });
    if (!record) return res.status(404).json({ message: "Attendance record not found" });
    if (!record.checkIn) return res.status(400).json({ message: "Not checked in yet" });
    if (record.checkOut) return res.status(400).json({ message: "Already checked out" });

    const now = new Date();
    const workHours = (now.getTime() - record.checkIn.getTime()) / (1000 * 60 * 60);

    const updated = await prisma.attendance.update({
      where: { id: Number(attendanceId) },
      data: {
        checkOut: now,
        workHours: Math.round(workHours * 100) / 100,
      },
      include: { user: { select: { userId: true, username: true, email: true } } },
    });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: "Error checking out", error: error.message });
  }
};

export const markAttendance = async (req: Request, res: Response) => {
  const { userId, date, status, notes, checkIn, checkOut } = req.body;
  try {
    const attendanceDate = new Date(date);
    const start = new Date(attendanceDate.getFullYear(), attendanceDate.getMonth(), attendanceDate.getDate());
    const end = new Date(attendanceDate.getFullYear(), attendanceDate.getMonth(), attendanceDate.getDate(), 23, 59, 59);

    const existing = await prisma.attendance.findFirst({
      where: { userId: Number(userId), date: { gte: start, lte: end } },
    });

    let workHours = null;
    if (checkIn && checkOut) {
      workHours = (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60);
      workHours = Math.round(workHours * 100) / 100;
    }

    let attendance;
    if (existing) {
      attendance = await prisma.attendance.update({
        where: { id: existing.id },
        data: { status, notes, checkIn: checkIn ? new Date(checkIn) : undefined, checkOut: checkOut ? new Date(checkOut) : undefined, workHours },
        include: { user: { select: { userId: true, username: true, email: true } } },
      });
    } else {
      attendance = await prisma.attendance.create({
        data: {
          userId: Number(userId),
          date: attendanceDate,
          status,
          notes,
          checkIn: checkIn ? new Date(checkIn) : null,
          checkOut: checkOut ? new Date(checkOut) : null,
          workHours,
        },
        include: { user: { select: { userId: true, username: true, email: true } } },
      });
    }
    res.json(attendance);
  } catch (error: any) {
    res.status(500).json({ message: "Error marking attendance", error: error.message });
  }
};

export const getAttendanceSummary = async (req: Request, res: Response) => {
  const { month, year } = req.query;
  try {
    const m = Number(month) || new Date().getMonth() + 1;
    const y = Number(year) || new Date().getFullYear();
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);

    const users = await prisma.user.findMany({
      select: { userId: true, username: true, email: true },
    });

    const attendance = await prisma.attendance.findMany({
      where: { date: { gte: start, lte: end } },
    });

    const summary = users.map(user => {
      const userAttendance = attendance.filter(a => a.userId === user.userId);
      const present = userAttendance.filter(a => a.status === "Present").length;
      const late = userAttendance.filter(a => a.status === "Late").length;
      const absent = userAttendance.filter(a => a.status === "Absent").length;
      const halfDay = userAttendance.filter(a => a.status === "Half Day").length;
      const wfh = userAttendance.filter(a => a.status === "WFH").length;
      const totalHours = userAttendance.reduce((sum, a) => sum + (a.workHours || 0), 0);

      return {
        user,
        present,
        late,
        absent,
        halfDay,
        wfh,
        totalDays: userAttendance.length,
        totalHours: Math.round(totalHours * 100) / 100,
      };
    });

    res.json(summary);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching summary", error: error.message });
  }
};

export const deleteAttendance = async (req: Request, res: Response) => {
  const { attendanceId } = req.params;
  try {
    await prisma.attendance.delete({ where: { id: Number(attendanceId) } });
    res.json({ message: "Attendance record deleted" });
  } catch (error: any) {
    res.status(500).json({ message: "Error while deleting attendance", error: error.message });
  }
};
