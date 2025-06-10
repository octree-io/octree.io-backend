import express from "express";
import { verifyToken } from "../middleware/jwtMiddleware";
import { getHintForLeetcodeProblem, getLeetcodeProblem, runCode } from "../controllers/practiceroom.controller";

const router = express.Router();

router.post("/leetcode", verifyToken, getLeetcodeProblem);
router.post("/hint", verifyToken, getHintForLeetcodeProblem);
router.post("/run", verifyToken, runCode);

export default router;
