import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import analyzeRoutes from "./routes/analyzeRoutes.js";
import { setupSwagger } from "./swagger.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

setupSwagger(app);
app.use("/api/analyze", analyzeRoutes);

/**
 * @openapi
 * /api/analyze:
 *   post:
 *     summary: Analyze a resume against a job description.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               resume:
 *                 type: string
 *                 format: binary
 *               resumeText:
 *                 type: string
 *               jdText:
 *                 type: string
 *             required:
 *               - jdText
 *     responses:
 *       200:
 *         description: Analysis result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     resumeSkills:
 *                       type: array
 *                       items:
 *                         type: string
 *                     jdSkills:
 *                       type: array
 *                       items:
 *                         type: string
 *                     matchedSkills:
 *                       type: array
 *                       items:
 *                         type: string
 *                     missingSkills:
 *                       type: array
 *                       items:
 *                         type: string
 *                     matchPercentage:
 *                       type: integer
 *                     verdict:
 *                       type: string
 *                     reasons:
 *                       type: array
 *                       items:
 *                         type: string
 */
app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Resume AI Analyzer Backend is Running 🚀"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});