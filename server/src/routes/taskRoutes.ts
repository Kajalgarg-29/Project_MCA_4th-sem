import { Router } from "express";
import { getTasks, createTask, updateTask, updateTaskStatus, deleteTask } from "../controllers/taskController";

const router = Router();
router.get("/", getTasks);
router.post("/", createTask);
router.patch("/:taskId/status", updateTaskStatus);
router.put("/:taskId", updateTask);
router.delete("/:taskId", deleteTask);
export default router;
