import express from "express";
import {
  changeUsername,
  googleLogin,
  googleSignup,
  logout,
  passwordLogin,
  passwordSignup,
  refreshToken
} from "../controllers/auth.controller";
import { verifyToken } from "../middleware/jwtMiddleware";
const router = express.Router();

router.post("/google/signin", googleLogin);
router.post("/google/signup", googleSignup);
router.post("/login", passwordLogin);
router.post("/signup", passwordSignup);
router.get("/refresh-token", refreshToken);
router.get("/logout", logout);
router.post("/change-username", verifyToken, changeUsername);

export default router;
