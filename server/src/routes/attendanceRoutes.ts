import { Router } from "express";
import { getAttendance, getTodayAttendance, checkIn, checkOut, markAttendance, getAttendanceSummary, deleteAttendance } from "../controllers/attendanceController";
import { authenticate } from "../middleware/auth";

const router = Router();
router.use(authenticate);
router.get("/", getAttendance);
router.get("/today", getTodayAttendance);
router.get("/summary", getAttendanceSummary);
router.post("/checkin", checkIn);
router.patch("/checkout/:attendanceId", checkOut);
router.post("/mark", markAttendance);
router.delete("/:attendanceId", deleteAttendance);
export default router;
