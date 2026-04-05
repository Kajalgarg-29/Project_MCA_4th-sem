import { Router } from "express";
import { getEvents, getAllEvents, createEvent, updateEvent, deleteEvent } from "../controllers/eventController";
import { authenticate } from "../middleware/auth";

const router = Router();
router.use(authenticate);
router.get("/", getEvents);
router.get("/all", getAllEvents);
router.post("/", createEvent);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);
export default router;
