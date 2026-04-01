import { Router } from "express";
import { analyzeSEO, analyzeCompetitor } from "../controllers/seoController";

const router = Router();

router.post("/analyze", analyzeSEO);
router.post("/competitor", analyzeCompetitor);

export default router;