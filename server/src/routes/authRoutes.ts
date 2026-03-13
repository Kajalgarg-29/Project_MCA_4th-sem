import { Router } from "express";
import { register, login, getMe, googleSignIn } from "../controllers/authController";

const router = Router();
router.post("/register", register);
router.post("/login", login);
router.get("/me", getMe);
router.post("/google-signin", googleSignIn);
export default router;
