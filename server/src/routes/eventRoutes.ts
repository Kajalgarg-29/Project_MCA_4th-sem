import { Router } from "express";
import { getEvents, getAllEvents, createEvent, updateEvent, deleteEvent } from "../controllers/eventController";

const router = Router();
router.get("/", getEvents);
router.get("/all", getAllEvents);
router.post("/", createEvent);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);
export default router;
