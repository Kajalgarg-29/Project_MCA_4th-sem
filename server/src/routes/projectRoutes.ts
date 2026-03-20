import { Router } from "express";
import { getProjects, createProject, deleteProject } from "../controllers/projectController";

const router = Router();
router.get("/", getProjects);
router.post("/", createProject);
router.delete("/:projectId", deleteProject);
export default router;
