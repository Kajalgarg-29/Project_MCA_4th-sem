import { Router } from "express";
import { getProjects, createProject, deleteProject } from "../controllers/projectController";
import { authenticate } from "../middleware/auth";

const router = Router();
router.use(authenticate);
router.get("/", getProjects);
router.post("/", createProject);
router.delete("/:projectId", deleteProject);
export default router;
