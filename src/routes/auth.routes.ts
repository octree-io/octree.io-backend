import express from "express";
import {
  googleLogin,
  googleSignup,
  logout,
  passwordLogin,
  passwordSignup,
  refreshToken
} from "../controllers/auth.controller";
const router = express.Router();

router.post("/google/signin", googleLogin);
router.post("/google/signup", googleSignup);
router.post("/login", passwordLogin);
router.post("/signup", passwordSignup);
router.get("/refresh-token", refreshToken);
router.get("/logout", logout);

export default router;
