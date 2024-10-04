import express from "express";
import { runCode, submitCode } from "../controllers/executor.controller";
import { verifyToken } from "../middleware/jwtMiddleware";

const router = express.Router();

router.post("/run", verifyToken, runCode);
router.post("/submit", verifyToken, submitCode);

export default router;
