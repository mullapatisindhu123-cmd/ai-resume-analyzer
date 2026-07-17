import mammoth from "mammoth";

const normalizeText = (text: string): string =>
  text
    .replace(/\s+/g, " ")
    .replace(/•/g, "\n")
    .trim()

export const extractTextFromResumeFile = async (
  file: Express.Multer.File,
): Promise<string> => {
  const fileName = file.originalname.toLowerCase()
  const pdfParseModule = await import("pdf-parse")
  const pdfParse =
    typeof pdfParseModule === "function"
      ? pdfParseModule
      : typeof pdfParseModule.default === "function"
      ? pdfParseModule.default
      : typeof pdfParseModule.parse === "function"
      ? pdfParseModule.parse
      : undefined

  if (!pdfParse) {
    throw new Error("Unable to load pdf-parse module for resume parsing.")
  }

  if (fileName.endsWith(".pdf")) {
    const data = await pdfParse(file.buffer)
    return normalizeText(data.text)
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
