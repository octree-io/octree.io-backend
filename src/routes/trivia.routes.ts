import express from "express";
import { verifyToken } from "../middleware/jwtMiddleware";
import { createQuestionBank, createTriviaRoom, deleteQuestionBank, getQuestionBanks, getTriviaRoom, gradeAnswers } from "../controllers/trivia.controller";

const router = express.Router();

router.post("/question-bank", verifyToken, createQuestionBank);
router.get("/question-bank", verifyToken, getQuestionBanks);
router.delete("/question-bank/:questionBankId", verifyToken, deleteQuestionBank);
router.post("/room", verifyToken, createTriviaRoom);
router.get("/room/:roomId", verifyToken, getTriviaRoom);
router.post("/grade", verifyToken, gradeAnswers);

export default router;
