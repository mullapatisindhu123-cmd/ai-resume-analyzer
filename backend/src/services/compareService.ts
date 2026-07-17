import { normalizeSkillForComparison, normalizeTextForSearch, parseSkills } from "./parserService.js";

export type AnalysisResult = {
  resumeSkills: string[]
  jdSkills: string[]
  matchedSkills: string[]
  missingSkills: string[]
  matchPercentage: number
  verdict: string
  reasons: string[]
}

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

const matchesJobSkill = (
  jobSkill: string,
  resumeSkills: string[],
  normalizedResumeText: string,
): boolean => {
  const normalizedJobSkill = normalizeSkillForComparison(jobSkill)

  if (!normalizedJobSkill) {
    return false
  }

  const directTokenMatch = resumeSkills.some(
    (resumeSkill) =>
      normalizeSkillForComparison(resumeSkill) === normalizedJobSkill,
  )

  if (directTokenMatch) {
    return true
  }

  const regexText = normalizedJobSkill
    .split(/\s+/)
    .map((part) => escapeRegExp(part))
    .join("\\s+")

  const regex = new RegExp(`\\b${regexText}\\b`, "i")
  return regex.test(normalizedResumeText)
}

export const analyzeResumeData = ({
  resumeText,
  jdText,
}: {
  resumeText: string
  jdText: string
}): AnalysisResult => {
  const resumeSkills = parseSkills(resumeText)
  const jdSkills = parseSkills(jdText)
  const normalizedResumeText = normalizeTextForSearch(resumeText)

  const matchedSkills = jdSkills.filter((jobSkill) =>
    matchesJobSkill(jobSkill, resumeSkills, normalizedResumeText),
  )

  const missingSkills = jdSkills.filter(
    (jobSkill) =>
      !matchedSkills.some(
        (skill) =>
          normalizeSkillForComparison(skill) ===
          normalizeSkillForComparison(jobSkill),
      ),
  )

  const matchPercentage = jdSkills.length
    ? Math.round((matchedSkills.length / jdSkills.length) * 100)
    : 0

  const verdict =
    matchPercentage >= 80 ? "Qualified" : matchPercentage >= 50 ? "Almost There" : "Not Yet"

  const reasons = [
    matchedSkills.length
      ? `Strong experience in ${matchedSkills.join(", ")}.`
      : "No core JD skills were matched.",
    `The resume matches ${matchPercentage}% of the JD skill set.`,
    missingSkills.length
      ? `Missing skills: ${missingSkills.join(", ")}.`
      : "All required skills are covered in the resume.",
  ]

  return {
    resumeSkills,
    jdSkills,
    matchedSkills,
    missingSkills,
    matchPercentage,
    verdict,
    reasons,
  }
}
