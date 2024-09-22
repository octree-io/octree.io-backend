import express from "express";
import { login, logout, registerUser } from "../controllers/auth.controller";
const router = express.Router();

router.get("/login", login);
router.post("/register", registerUser);
router.delete("/logout", logout);

export default router;
