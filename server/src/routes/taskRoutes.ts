import { Router } from "express";
import { getTasks, createTask, updateTaskStatus, deleteTask } from "../controllers/taskController";
import { authenticate } from "../middleware/auth";

const router = Router();
router.use(authenticate);
router.get("/", getTasks);
router.post("/", createTask);
router.patch("/:taskId/status", updateTaskStatus);
router.delete("/:taskId", deleteTask);
export default router;
