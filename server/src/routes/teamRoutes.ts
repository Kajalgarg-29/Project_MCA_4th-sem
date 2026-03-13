import { Router } from "express";
import {
  getTeams, createTeam, updateTeam, deleteTeam,
  addMemberToTeam, removeMemberFromTeam,
  assignProjectToTeam, removeProjectFromTeam,
} from "../controllers/teamController";

const router = Router();

router.get("/", getTeams);
router.post("/", createTeam);
router.put("/:teamId", updateTeam);
router.delete("/:teamId", deleteTeam);
router.post("/:teamId/members", addMemberToTeam);
router.delete("/:teamId/members/:userId", removeMemberFromTeam);
router.post("/:teamId/projects", assignProjectToTeam);
router.delete("/:teamId/projects/:projectId", removeProjectFromTeam);

export default router;
