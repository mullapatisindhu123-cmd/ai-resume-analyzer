import { Request, Response, type Express } from "express";
import { analyzeResumeData } from "../services/compareService.js";
import { extractTextFromResumeFile } from "../services/parserService.js";

type MulterRequest = Request & { file?: Express.Multer.File };

export const analyzeResume = async (
  req: MulterRequest,
  res: Response,
): Promise<void> => {
  try {
    const resumeTextFromBody = String(req.body.resumeText ?? "").trim();
    const jdText = String(req.body.jdText ?? "").trim();

    if (!resumeTextFromBody && !req.file) {
      res.status(400).json({
        success: false,
        message: "Upload a resume file or paste resume text to analyze.",
      });
      return;
    }

    if (!jdText) {
      res.status(400).json({
        success: false,
        message: "Please provide the job description skills or requirements.",
      });
      return;
    }

    let resumeText = resumeTextFromBody;
    if (req.file) {
      const extractedText = await extractTextFromResumeFile(req.file);
      resumeText = resumeText ? `${resumeText}\n${extractedText}` : extractedText;
    }

    const analysis = analyzeResumeData({ resumeText, jdText });
    res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to analyze resume file.";
    res.status(500).json({ success: false, message });
  }
};