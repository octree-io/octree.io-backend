import express from "express";
import { executeCode } from "../controllers/executor.controller";
const router = express.Router();

router.post("/", executeCode);

export default router;
