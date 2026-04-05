import { Router } from "express";
import { getCampaigns, getCampaign, createCampaign, updateCampaign, deleteCampaign } from "../controllers/campaignController";
import { authenticate } from "../middleware/auth";

const router = Router();
router.use(authenticate);
router.get("/", getCampaigns);
router.get("/:id", getCampaign);
router.post("/", createCampaign);
router.put("/:id", updateCampaign);
router.delete("/:id", deleteCampaign);
export default router;
