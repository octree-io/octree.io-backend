import express from "express";
import { verifyToken } from "../middleware/jwtMiddleware";
import { createGameRoom } from "../controllers/gameroom.controllers";

const router = express.Router();

router.post("/", verifyToken, createGameRoom);

export default router;
