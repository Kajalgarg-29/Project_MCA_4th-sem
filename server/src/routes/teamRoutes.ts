import { Router } from "express";
import { getTeams, createTeam, updateTeam, deleteTeam, addUserToTeam, removeUserFromTeam } from "../controllers/teamController";
import { authenticate, requireManagerOrAdmin } from "../middleware/auth";

const router = Router();
router.use(authenticate);
router.get("/", getTeams);
router.post("/", requireManagerOrAdmin, createTeam);
router.put("/:teamId", requireManagerOrAdmin, updateTeam);
router.delete("/:teamId", requireManagerOrAdmin, deleteTeam);
router.post("/:teamId/members", requireManagerOrAdmin, addUserToTeam);
router.delete("/members/:userId", requireManagerOrAdmin, removeUserFromTeam);
export default router;
