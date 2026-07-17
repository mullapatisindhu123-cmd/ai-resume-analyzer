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
  const [jdText, setJdText] = useState('React\nTypeScript\nRedux\nAWS\nDocker')
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
    const file = event.target.files?.[0] ?? null
    setResumeFile(file)
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
              onChange={(event) => setResumeText(event.target.value)}
              placeholder="Paste resume text here if upload isn't available."
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
            <div className="section-title">Paste the job description</div>
            <textarea
              value={jdText}
              onChange={(event) => setJdText(event.target.value)}
              placeholder="React\nTypeScript\nAWS\nDocker\nKubernetes"
              aria-label="Job description text"
            />
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
            <div className="metric-value">{result?.matchedSkills.length ?? 0} Skills</div>
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
            <div className="metric-value">{result?.missingSkills.length ?? 0} Skills</div>
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
            <div className="score-value">{result?.matchPercentage ?? 0}%</div>
            <div className="progress-bar">
              <div
                className={`progress-fill ${scoreColor}`}
                style={{ width: `${result?.matchPercentage ?? 0}%` }}
              />
            </div>
          </article>

          <article className="card metric-card verdict-card">
            <div className="metric-label">Fit Verdict ✅</div>
            <div className="verdict-value">{result?.verdict ?? 'Awaiting analysis'}</div>
            <div className="verdict-stars">{'★'.repeat(starRating) + '☆'.repeat(5 - starRating)}</div>
          </article>
        </div>

        <article className="card explanation-card">
          <div className="card-header">
            <h2>AI Explanation</h2>
            <p>Actionable insights from the resume comparison.</p>
          </div>
          <div className="card-body">
            {result ? (
              <ul className="explanation-list">
                {result.reasons.map((reason, index) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
            ) : (
              <p className="placeholder-text">AI reasoning will appear here once the analysis completes.</p>
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
