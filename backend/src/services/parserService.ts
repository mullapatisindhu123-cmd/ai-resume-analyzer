import mammoth from "mammoth"
import { PDFParse } from "pdf-parse"

const normalizeText = (text: string): string =>
  text
    // Newlines often separate individual skills. Preserve them so they can be
    // parsed as separate entries after extracting text from a document.
    .replace(/\r\n?/g, "\n")
    .replace(/[^\S\r\n]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/•/g, "\n")
    .trim()

const cleanSkillText = (text: string): string =>
  text
    .trim()
    .replace(/^[\d\-\.\s]+/, "")
    .replace(/^[A-Za-z\s]+:\s*/i, "")
    .replace(/[(),;]$/g, "")
    .replace(/\.tsx?$/i, "")
    .replace(/\.jsx?$/i, "")
    .replace(/\.js$/i, "")
    .replace(/\.ts$/i, "")
    .replace(/react\s*\.?(js)?/i, "React")
    .replace(/next\s*\.?(js)?/i, "Next")
    .replace(/express\s*\.?(js)?/i, "Express")
    .replace(/node\s*\.?(js)?/i, "Node")
    .replace(/reactjs/i, "React")
    .replace(/nextjs/i, "Next")
    .replace(/expressjs/i, "Express")
    .replace(/nodejs/i, "Node")
    .replace(/\brest\s*api(?:s)?\b/i, "REST API")
    .replace(/\bapis?\b/i, "API")
    .replace(/\s+/g, " ")
    .trim()

export const normalizeSkillForComparison = (skill: string): string =>
  cleanSkillText(skill).toLowerCase()

export const normalizeTextForSearch = (text: string): string =>
  text
    .replace(/\breact\s*\.?(?:js)?\b/gi, "React")
    .replace(/\bnext\s*\.?(?:js)?\b/gi, "Next")
    .replace(/\bexpress\s*\.?(?:js)?\b/gi, "Express")
    .replace(/\bnode\s*\.?(?:js)?\b/gi, "Node")
    // This must mirror cleanSkillText: both "REST API" and "REST APIs" are
    // one skill, regardless of whether it came from the resume or the JD.
    .replace(/\brest\s+apis?\b/gi, "REST API")
    .replace(/\bapis?\b/gi, "API")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()

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
    .split(/\r?\n|,|•|;|\s+(?:and|or)\s+/i)
    .map((line) => cleanSkillText(line))
    .filter(Boolean)

  return Array.from(new Set(lines))
}
