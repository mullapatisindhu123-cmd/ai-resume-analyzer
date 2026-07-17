import { Router } from "express";
import multer from "multer";
import { analyzeResume } from "../controllers/analyzeController.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("resume"), analyzeResume);

export default router;