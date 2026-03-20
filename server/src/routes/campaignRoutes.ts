import { Router } from "express";
import { getCampaigns, getCampaign, createCampaign, updateCampaign, deleteCampaign } from "../controllers/campaignController";

const router = Router();
router.get("/", getCampaigns);
router.get("/:id", getCampaign);
router.post("/", createCampaign);
router.put("/:id", updateCampaign);
router.delete("/:id", deleteCampaign);
export default router;
