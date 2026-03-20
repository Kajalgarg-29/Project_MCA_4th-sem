import { Router } from "express";
import { getTasks, createTask, updateTaskStatus, deleteTask } from "../controllers/taskController";

const router = Router();
router.get("/", getTasks);
router.post("/", createTask);
router.patch("/:taskId/status", updateTaskStatus);
router.delete("/:taskId", deleteTask);
export default router;
