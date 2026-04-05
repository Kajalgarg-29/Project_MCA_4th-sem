"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const seoController_1 = require("../controllers/seoController");
const router = (0, express_1.Router)();
router.post("/analyze", seoController_1.analyzeSEO);
router.post("/competitor", seoController_1.analyzeCompetitor);
exports.default = router;
