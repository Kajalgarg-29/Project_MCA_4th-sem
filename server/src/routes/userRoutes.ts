import { Router } from "express";
import { getUsers, createUser, updateUser, deleteUser } from "../controllers/userController";
import { authenticate, requireAdmin } from "../middleware/auth";

const router = Router();
router.use(authenticate);
router.get("/", getUsers);
router.post("/", requireAdmin, createUser);
router.put("/:userId", updateUser);
router.delete("/:userId", requireAdmin, deleteUser);
export default router;
