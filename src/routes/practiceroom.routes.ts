import express from "express";
import { getHintForLeetcodeProblem, getLeetcodeProblem, runCode } from "../controllers/practiceroom.controller";

const router = express.Router();

router.post("/leetcode", getLeetcodeProblem);
router.post("/hint", getHintForLeetcodeProblem);
router.post("/run", runCode);

export default router;
