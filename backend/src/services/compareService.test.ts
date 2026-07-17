import assert from "node:assert/strict"
import test from "node:test"

import { analyzeResumeData } from "./compareService.js"

test("matches normalized skills that appear inside resume sentences", () => {
  const result = analyzeResumeData({
    resumeText:
      "Built web applications with React.js, TypeScript, and REST APIs. " +
      "Created an email system using AWS Lambda and Amazon SES.",
    jdText:
      "React\nTypeScript\nRedux\nREST APIs\nAWS\nDocker\nPython\nAutomated testing",
  })

  assert.deepEqual(result.matchedSkills, [
    "React",
    "TypeScript",
    "REST API",
    "AWS",
  ])
  assert.equal(result.matchPercentage, 50)
  assert.equal(result.verdict, "Almost There")
})
