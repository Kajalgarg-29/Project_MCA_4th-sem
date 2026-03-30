import { Router } from "express";
import { register, login, getMe, googleSignIn, updateRole } from "../controllers/authController";

const router = Router();
router.post("/register", register);
router.post("/login", login);
router.get("/me", getMe);
router.post("/google-signin", googleSignIn);
router.patch("/role/:userId", updateRole);
export default router;
