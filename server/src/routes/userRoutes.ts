import { Router } from "express";
import { getUsers, createUser, updateUser, deleteUser } from "../controllers/userController";

const router = Router();
router.get("/", getUsers);
router.post("/", createUser);
router.put("/:userId", updateUser);
router.delete("/:userId", deleteUser);
export default router;
