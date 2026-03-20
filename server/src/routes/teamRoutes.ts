import { Router } from "express";
import { getTeams, createTeam, updateTeam, deleteTeam, addUserToTeam, removeUserFromTeam } from "../controllers/teamController";

const router = Router();
router.get("/", getTeams);
router.post("/", createTeam);
router.put("/:teamId", updateTeam);
router.delete("/:teamId", deleteTeam);
router.post("/:teamId/members", addUserToTeam);
router.delete("/members/:userId", removeUserFromTeam);
export default router;
