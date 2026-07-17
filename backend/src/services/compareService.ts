import { parseSkills } from "./parserService.js";

export type AnalysisResult = {
  resumeSkills: string[]
  jdSkills: string[]
  matchedSkills: string[]
  missingSkills: string[]
  matchPercentage: number
  verdict: string
  reasons: string[]
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

  const matchedSkills = jdSkills.filter((jobSkill) =>
    resumeSkills.some((resumeSkill) => resumeSkill.toLowerCase() === jobSkill.toLowerCase()),
  )

  const missingSkills = jdSkills.filter(
    (jobSkill) =>
      !matchedSkills.some((skill) => skill.toLowerCase() === jobSkill.toLowerCase()),
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
