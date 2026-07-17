import mammoth from "mammoth"
import { PDFParse } from "pdf-parse"

const normalizeText = (text: string): string =>
  text
    .replace(/\s+/g, " ")
    .replace(/•/g, "\n")
    .trim()

export const extractTextFromResumeFile = async (
  file: Express.Multer.File,
): Promise<string> => {
  const fileName = file.originalname.toLowerCase()

  if (fileName.endsWith(".pdf")) {
    const parser = new PDFParse({ data: file.buffer })
    try {
      const result = await parser.getText()
      return normalizeText(result.text)
    } finally {
      await parser.destroy()
    }
  }

  if (fileName.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer: file.buffer })
    return normalizeText(result.value)
  }

  if (fileName.endsWith(".txt")) {
    return normalizeText(file.buffer.toString("utf-8"))
  }

  throw new Error("Unsupported resume file type. Upload PDF, DOCX, or TXT.")
}

export const parseSkills = (text: string): string[] => {
  const lines = text
    .split(/\r?\n|,|•|;/)
    .map((line) => line.replace(/^[\d\-\.\s]+/, "").trim())
    .filter(Boolean)

  const likelySkills = lines.filter((line) => line.length <= 64)

  const normalized = likelySkills.map((item) => item.trim())
  return Array.from(new Set(normalized))
}
