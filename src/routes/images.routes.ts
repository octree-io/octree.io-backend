import express from "express";
import { verifyToken } from "../middleware/jwtMiddleware";
import { changeProfilePic } from "../controllers/images.controller";
import multer from "multer";

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
})

const router = express.Router();

router.post("/upload", verifyToken, upload.single("file"), changeProfilePic);

export default router;
