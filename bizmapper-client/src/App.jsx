import { useState } from 'react'
import './App.css'

const PRESETS = [
  '3-doctor clinic in Bangalore needing appointments, billing, WhatsApp reminders',
  '50-driver logistics company needing delivery tracking and route optimization',
  '10-person CA firm needing client portal, document storage, invoice generation',
  'E-commerce store needing inventory, payments, and customer support',
]

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

function App() {
  const [businessDescription, setBusinessDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)

  const handlePresetClick = (preset) => {
    setBusinessDescription(preset)
  }

  const handleAnalyze = async (e) => {
    e.preventDefault()
    
    if (!businessDescription.trim()) {
      setError('Please describe your business')
      return
    }

    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ businessDescription }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success && data.data) {
        setResults(data.data)
      } else {
        setError('Invalid response from server')
      }
    } catch (err) {
      setError(err.message || 'Failed to analyze business description')
    } finally {
      setLoading(false)
    }
  }

  const formatINR = (num) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(num)
  }

  const formatINRCompact = (num) => {
    if (typeof num !== 'number') {
      return '₹0'
    }

    return `₹${new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(num)}`
  }

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return '#dc2626'
      case 'medium':
        return '#f97316'
      case 'low':
        return '#16a34a'
      default:
        return '#6b7280'
    }
  }

  const getBusinessSizeColor = (size) => {
    switch (size?.toLowerCase()) {
      case 'small':
        return 'size-small'
      case 'medium':
        return 'size-medium'
      case 'large':
        return 'size-large'
      default:
        return 'size-default'
    }
  }

  const getBudgetTierClass = (tier) => {
    switch (tier?.toLowerCase()) {
      case 'bootstrap':
        return 'tier-bootstrap'
      case 'growth':
        return 'tier-growth'
      case 'scale':
        return 'tier-scale'
      default:
        return 'tier-default'
    }
  }

  const getSolutionBadge = (index, options) => {
    if (index === 1) {
      return 'More Control'
    }

    const leftMonthly = Number(options?.[0]?.totalMonthlyINR ?? Number.POSITIVE_INFINITY)
    const rightMonthly = Number(options?.[1]?.totalMonthlyINR ?? Number.POSITIVE_INFINITY)
    return leftMonthly <= rightMonthly ? 'Recommended' : ''
  }

  return (
    <>
      <div className="app-container">
        <header className="header">
          <div className="header-content">
            <div>
              <h1>BizMapper</h1>
              <p className="subtitle">Describe your business → get your tech blueprint</p>
            </div>
          </div>
        </header>

      <main className="main-content">
        <section className="input-section">
          <div className="preset-buttons">
            {PRESETS.map((preset) => (
              <button
                key={preset}
                className="preset-btn"
                onClick={() => handlePresetClick(preset)}
                title="Click to fill the description"
              >
                {preset}
              </button>
            ))}
          </div>

          <textarea
            className="business-textarea"
            placeholder="Describe your business in plain English..."
            value={businessDescription}
            onChange={(e) => setBusinessDescription(e.target.value)}
            rows="6"
          />

          {error && <div className="error-message">{error}</div>}

          <button
            className="analyze-btn"
            onClick={handleAnalyze}
            disabled={loading || !businessDescription.trim()}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Analyzing...
              </>
            ) : (
              'Analyze'
            )}
          </button>
        </section>

        {results && (
          <section className="results-section">
            {/* Summary Card */}
            <div className="result-card summary-card">
              <div className="summary-header">
                <h2>Summary</h2>
                <span className={`badge size-badge ${getBusinessSizeColor(results.businessSize)}`}>
                  {results.businessSize || 'unknown'}
                </span>
              </div>
              <p>{results.summary}</p>
            </div>

            {/* Business Processes Card */}
            <div className="result-card">
              <h2>Business Processes</h2>
              <div className="table">
                {results.processes && results.processes.length > 0 ? (
                  results.processes.map((process, idx) => (
                    <div key={idx} className="table-row">
                      <div className="table-cell">
                        <strong>{process.name}</strong>
                        <p>{process.description}</p>
                        {process.workflow && (
                          <div className="workflow-box">{process.workflow}</div>
                        )}
                        {process.scaleNote && (
                          <div className="scale-note">At scale: {process.scaleNote}</div>
                        )}
                      </div>
                      <div className="table-cell small">
                        <span
                          className="badge"
                          style={{ backgroundColor: getPriorityColor(process.priority) }}
                        >
                          {process.priority?.toUpperCase() || 'N/A'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No processes available</p>
                )}
              </div>
            </div>

            {/* Recommended Tools Card */}
            <div className="result-card">
              <h2>Recommended Tools</h2>
              <div className="table">
                {results.recommendedTools && results.recommendedTools.length > 0 ? (
                  results.recommendedTools.map((tool, idx) => (
                    <div key={idx} className="table-row">
                      <div className="table-cell">
                        <strong>{tool.tool}</strong>
                        <span className="badge category">{tool.category}</span>
                        <p>{tool.reason}</p>
                        {tool.freeAlternative && (
                          <span className="free-alt-badge">Free alt: {tool.freeAlternative}</span>
                        )}
                        {tool.tradeoff && (
                          <div className="tradeoff-text">Trade-off: {tool.tradeoff}</div>
                        )}
                      </div>
                      <div className="table-cell small">
                        <span className="cost-badge">
                          {formatINRCompact(tool.monthlyCostINR)}/month
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No recommended tools available</p>
                )}
              </div>
            </div>

            {/* Developer Stack Card */}
            <div className="result-card">
              <h2>Developer Stack</h2>
              {results.techStack ? (
                <div className="stack-grid">
                  <div className="stack-row"><strong>Frontend:</strong> <span>{results.techStack.frontend}</span></div>
                  <div className="stack-row"><strong>Backend:</strong> <span>{results.techStack.backend}</span></div>
                  <div className="stack-row"><strong>Database:</strong> <span>{results.techStack.database}</span></div>
                  <div className="stack-row"><strong>Hosting:</strong> <span>{results.techStack.hosting}</span></div>
                  <p className="stack-reasoning"><em>{results.techStack.reasoning}</em></p>
                </div>
              ) : (
                <p>No developer stack available</p>
              )}
            </div>

            {/* Solution Options Card */}
            <div className="result-card solution-card">
              <h2>Solution Options</h2>
              {results.solutionOptions && results.solutionOptions.length > 0 ? (
                <div className="solution-options-grid">
                  {results.solutionOptions.slice(0, 2).map((option, idx) => (
                    <div key={idx} className="solution-option-card">
                      <div className="solution-option-header">
                        <strong>{option.optionName}</strong>
                        {getSolutionBadge(idx, results.solutionOptions) && (
                          <span className={`badge solution-badge ${idx === 0 ? 'solution-badge-green' : 'solution-badge-blue'}`}>
                            {getSolutionBadge(idx, results.solutionOptions)}
                          </span>
                        )}
                      </div>
                      <p className="solution-muted">{option.approach}</p>
                      <p className="solution-pros">✓ {option.pros}</p>
                      <p className="solution-cons">✗ {option.cons}</p>
                      <p className="solution-cost">{formatINR(option.totalMonthlyINR)}/month</p>
                      <p className="solution-bestfor"><em>{option.bestFor}</em></p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No solution options available</p>
              )}
            </div>

            {/* Cost Breakdown Card */}
            <div className="result-card budget-card">
              <h2>Cost Breakdown</h2>
              {results.budgetBreakdown ? (
                <div className="cost-breakdown">
                  <div className="cost-list">
                    {results.budgetBreakdown.items?.map((item, idx) => (
                      <div className="cost-row" key={idx}>
                        <span>{item.name}</span>
                        <span>{formatINR(item.monthlyINR)} / {formatINR(item.yearlyINR)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="cost-divider"></div>
                  <div className="cost-row total-row">
                    <span>Total</span>
                    <span>
                      {formatINR(results.budgetBreakdown.totalMonthlyINR)} / {formatINR(results.budgetBreakdown.totalYearlyINR)}
                    </span>
                  </div>
                  <div className="tier-row">
                    <span className={`badge tier-badge ${getBudgetTierClass(results.budgetBreakdown.budgetTier)}`}>
                      {results.budgetBreakdown.budgetTier || 'unknown'}
                    </span>
                  </div>
                  <p className="muted-italic">
                    {results.budgetBreakdown.reasoning}
                  </p>
                </div>
              ) : (
                <p>No budget breakdown available</p>
              )}
            </div>

            {/* Assumptions & Clarifications Card */}
            {((results.assumptions && results.assumptions.length > 0) ||
              (results.clarifyingQuestions && results.clarifyingQuestions.length > 0)) && (
              <div className="result-card assumptions-card">
                <h2>Assumptions made</h2>
                {results.assumptions && results.assumptions.length > 0 && (
                  <ul className="assumptions-list">
                    {results.assumptions.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                )}
                {results.clarifyingQuestions && results.clarifyingQuestions.length > 0 && (
                  <>
                    <p className="clarifying-title">To improve results, answer:</p>
                    <ul className="assumptions-list muted-list">
                      {results.clarifyingQuestions.map((question, idx) => (
                        <li key={idx}>{question}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}

            {/* Architecture Flow Card */}
            <div className="result-card budget-card">
              <h2>Architecture Flow</h2>
              {results.architectureFlow && results.architectureFlow.length > 0 ? (
                <div className="architecture-flow">
                  {results.architectureFlow.map((step, idx) => (
                    <div key={idx} className="architecture-step-wrap">
                      <div className="architecture-step">{idx + 1}. {step}</div>
                      {idx < results.architectureFlow.length - 1 && (
                        <div className="architecture-arrow">↓</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No architecture flow available</p>
              )}
            </div>

            {/* Risks & Considerations Card */}
            {results.risksAndConsiderations && results.risksAndConsiderations.length > 0 && (
              <div className="result-card risks-card budget-card">
                <h2>⚠ Risks & Considerations</h2>
                <div className="risks-list">
                  {results.risksAndConsiderations.map((risk, idx) => (
                    <div key={idx} className="risk-item">
                      <strong>{risk.risk}</strong>
                      <p>{risk.description}</p>
                      <div className="risk-mitigation">🛡 {risk.mitigation}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="footer">
        <p>Built by Hardik Mehta · <a href="https://github.com/hanshuhardik" target="_blank" rel="noopener noreferrer">github.com/hanshuhardik</a></p>
      </footer>
      </div>
    </>
  )
}

export default App
