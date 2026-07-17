import { type ChangeEvent, useMemo, useRef, useState } from 'react'
import './App.css'

type AnalysisResult = {
  resumeSkills: string[]
  jdSkills: string[]
  matchedSkills: string[]
  missingSkills: string[]
  matchPercentage: number
  verdict: string
  reasons: string[]
}

type ApiResponse = {
  success: boolean
  message?: string
  data?: AnalysisResult
}

function App() {
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeText, setResumeText] = useState('')
  const [jdText, setJdText] = useState('')
  const [isJobDescriptionExample, setIsJobDescriptionExample] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const canAnalyze = Boolean((resumeFile || resumeText.trim()) && jdText.trim())

  const starRating = useMemo(() => {
    if (!result) return 0
    return Math.min(5, Math.max(1, Math.ceil(result.matchPercentage / 20)))
  }, [result])

  const scoreColor = useMemo(() => {
    if (!result) return 'secondary'
    if (result.matchPercentage > 70) return 'success'
    if (result.matchPercentage > 40) return 'warning'
    return 'danger'
  }, [result])

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setError(null)
    setResult(null)
    const file = event.target.files?.[0] ?? null
    setResumeFile(file)
  }

  const handleResumeTextChange = (value: string) => {
    setError(null)
    setResult(null)
    setResumeText(value)
  }

  const handleJobDescriptionChange = (value: string) => {
    setError(null)
    setResult(null)
    setIsJobDescriptionExample(false)
    setJdText(value)
  }

  const useJobDescriptionExample = () => {
    setError(null)
    setResult(null)
    setIsJobDescriptionExample(true)
    setJdText(`React\nTypeScript\nRedux\nREST APIs\nAWS\nDocker\nKubernetes\nAutomated testing`)
  }

  const clearJobDescriptionExample = () => {
    setError(null)
    setResult(null)
    setIsJobDescriptionExample(false)
    setJdText('')
  }

  const analyzeResume = async () => {
    if (!canAnalyze) {
      setError('Upload a resume or paste resume text, and enter the job description.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      if (resumeFile) {
        formData.append('resume', resumeFile)
      }
      formData.append('resumeText', resumeText)
      formData.append('jdText', jdText)

      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        body: formData,
      })

      const payload = (await response.json()) as ApiResponse

      if (!payload.success) {
        setError(payload.message || 'Unable to analyze resume at the moment.')
        setResult(null)
      } else {
        setResult(payload.data ?? null)
      }
    } catch {
      setError('Network error while sending the resume. Is the backend running?')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="app-shell">
      <nav className="nav-bar">
        <div className="nav-brand">AI Resume Skill Analyzer</div>
      </nav>

      <section className="hero-panel">
        <h1>AI Resume Skill Analyzer</h1>
        <p className="hero-subtitle">
          Upload a resume and compare it against a job description using AI-powered skill extraction and matching.
        </p>
      </section>

      <section className="form-grid">
        <article className="card resume-card">
          <div className="card-header">
            <h2>Resume</h2>
            <p>Upload a PDF or DOCX resume. If upload isn't available, paste the resume text below.</p>
          </div>

          <div className="card-section">
            <div className="section-title">Upload your resume</div>
            <div className="accepted-formats">Accepted formats: PDF, DOCX</div>
            <div className="file-upload-group">
              <input
                ref={fileInputRef}
                type="file"
                name="resume"
                accept=".pdf,.docx"
                onChange={handleFileChange}
                className="hidden-file-input"
              />
              <button
                type="button"
                className="upload-button"
                onClick={() => fileInputRef.current?.click()}
              >
                ⬆️ Upload Resume
              </button>
            </div>
            <div className="selected-file">
              {resumeFile ? <span>✔ {resumeFile.name}</span> : <span>No file selected</span>}
            </div>
          </div>

          <div className="divider" />

          <div className="card-section">
            <div className="section-title">Paste Resume Text</div>
            <textarea
              value={resumeText}
              onChange={(event) => handleResumeTextChange(event.target.value)}
              placeholder="Example: Skills: React, TypeScript, Git. Experience: Built responsive web applications and REST APIs."
              aria-label="Resume text"
            />
          </div>
        </article>

        <article className="card jd-card">
          <div className="card-header">
            <h2>Job Description</h2>
            <p>Paste the complete job description or only the required skills.</p>
          </div>

          <div className="card-section">
            <div className="input-heading">
              <div className="section-title">Paste the job description</div>
              {isJobDescriptionExample ? (
                <button type="button" className="clear-example-button" onClick={clearJobDescriptionExample}>
                  Clear example
                </button>
              ) : (
                <button type="button" className="example-button" onClick={useJobDescriptionExample}>
                  Use an example
                </button>
              )}
            </div>
            <textarea
              value={jdText}
              onChange={(event) => handleJobDescriptionChange(event.target.value)}
              placeholder={'Example required skills (one per line):\nReact\nTypeScript\nRedux\nREST APIs\nAWS\nDocker'}
              aria-label="Job description text"
              className={isJobDescriptionExample ? 'example-text' : undefined}
            />
            <p className="field-hint">Add the full role description or a simple list of required skills. The example is optional.</p>
          </div>
        </article>
      </section>

      <div className="action-row center-row">
        <button className="primary-button" onClick={analyzeResume} disabled={!canAnalyze || loading}>
          {loading ? 'Analyzing Resume...' : 'Analyze Resume'}
        </button>
      </div>

      {loading && (
        <div className="loading-card">
          <div>⏳ Extracting skills...</div>
          <div>⏳ Comparing requirements...</div>
          <div>⏳ Generating AI verdict...</div>
        </div>
      )}

      {error && <div className="status-message error">{error}</div>}

      <section className="results-section">
        <div className="results-title">
          <h2>Analysis Results</h2>
        </div>

        <div className="cards-grid">
          <article className="card metric-card success-card">
            <div className="metric-label">Matched Skills 🎯</div>
            <div className={`metric-value ${result ? '' : 'pending-value'}`}>{result?.matchedSkills.length ?? 0} Skills</div>
            <div className="metric-list">
              {result?.matchedSkills.length ? (
                result.matchedSkills.slice(0, 5).map((skill) => (
                  <span key={skill} className="metric-chip matched">
                    ✔ {skill}
                  </span>
                ))
              ) : (
                <span className="empty-state">No matches yet.</span>
              )}
            </div>
          </article>

          <article className="card metric-card warning-card">
            <div className="metric-label">Missing Skills ⚠️</div>
            <div className={`metric-value ${result ? '' : 'pending-value'}`}>{result?.missingSkills.length ?? 0} Skills</div>
            <div className="metric-list">
              {result?.missingSkills.length ? (
                result.missingSkills.slice(0, 5).map((skill) => (
                  <span key={skill} className="metric-chip missing">
                    {skill}
                  </span>
                ))
              ) : (
                <span className="empty-state">No missing items.</span>
              )}
            </div>
          </article>

          <article className="card metric-card score-card">
            <div className="metric-label">Match Score 📊</div>
            <div className={`score-value ${result ? '' : 'pending-value'}`}>{result?.matchPercentage ?? 0}%</div>
            <div className="progress-bar">
              <div
                className={`progress-fill ${scoreColor}`}
                style={{ width: `${result?.matchPercentage ?? 0}%` }}
            />
            <p className={`score-caption ${result ? '' : 'pending-caption'}`}>
              {result ? `${result.matchedSkills.length} of ${result.jdSkills.length} required skills matched` : 'Analyze a resume to calculate the score.'}
            </p>
            </div>
          </article>

          <article className="card metric-card verdict-card">
            <div className="metric-label">Fit Verdict ✅</div>
            <div className={`verdict-value ${result ? '' : 'pending-value'}`}>{result?.verdict ?? 'Awaiting analysis'}</div>
            <div className={`verdict-stars ${result ? '' : 'pending-stars'}`}>{'★'.repeat(starRating) + '☆'.repeat(5 - starRating)}</div>
          </article>
        </div>

        <article className="card explanation-card">
          <div className="card-header">
            <h2>AI Explanation</h2>
            <p>Actionable insights from the resume comparison.</p>
          </div>
          <div className="card-body">
            {result ? (
              <div className="insights-grid">
                <div className="insight-block">
                  <h3>How the percentage is calculated</h3>
                  <p><strong>{result.matchedSkills.length} matched skills ÷ {result.jdSkills.length} required skills × 100 = {result.matchPercentage}%</strong></p>
                  <p>Every required skill has equal weight. The result is rounded to the nearest whole percentage.</p>
                </div>
                <div className="insight-block">
                  <h3>Required skill set</h3>
                  <div className="metric-list">
                    {result.jdSkills.map((skill) => <span key={skill} className="metric-chip required">{skill}</span>)}
                  </div>
                </div>
                <div className="insight-block">
                  <h3>How your resume is analyzed</h3>
                  <p>The analyzer reads short skill entries separated by lines, commas, bullets, or semicolons in your resume and job description. It then compares entries case-insensitively.</p>
                  <p>It reports skills present in both, highlights required skills not found, and assigns a fit verdict: Qualified (80%+), Almost There (50–79%), or Not Yet (below 50%). Use one skill per line for the most accurate comparison.</p>
                </div>
                <div className="insight-block">
                  <h3>Summary</h3>
                  <ul className="explanation-list">
                    {result.reasons.map((reason, index) => <li key={index}>{reason}</li>)}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="placeholder-text">Add your resume and job description, then select Analyze Resume. Your required skills, matches, score calculation, and tailored explanation will appear here.</p>
            )}
          </div>
        </article>
      </section>

      <footer className="footer-bar">
        <span>Powered by Gemini AI</span>
        <span>Supports PDF • DOCX • Text</span>
      </footer>
    </main>
  )
}

export default App
