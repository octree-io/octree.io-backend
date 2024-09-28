import express from "express";
import { getEchoMessage } from "../controllers/echo.controller";
import { verifyToken } from "../middleware/jwtMiddleware";
const router = express.Router();

router.get("/", getEchoMessage);
router.get("/protected", verifyToken, getEchoMessage);

export default router;
