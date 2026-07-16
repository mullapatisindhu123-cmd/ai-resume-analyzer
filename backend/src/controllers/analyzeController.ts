import { Request, Response } from "express";

export const analyzeResume = async (
  _req: Request,
  res: Response
): Promise<void> => {
  res.status(200).json({
    success: true,
    message: "Resume uploaded successfully!"
  });
};