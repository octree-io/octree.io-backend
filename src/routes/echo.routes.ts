import express from "express";
import { getEchoMessage } from "../controllers/echo.controller";
const router = express.Router();

router.get("/", getEchoMessage);

export default router;
