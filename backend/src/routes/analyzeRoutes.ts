import { Router } from "express";
import { analyzeResume } from "../controllers/analyzeController.js";

const router = Router();

router.post("/", analyzeResume);

export default router;