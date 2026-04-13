'use client'
import { useState } from 'react'
import styles from './SpecAnalyser.module.css'

interface DimensionScores { clarity: number; completeness: number; testability: number; feasibility: number; edge_case_coverage: number }
interface Gap { severity: 'critical' | 'major' | 'minor'; section: string; issue: string; suggestion: string }
interface VagueItem { quote: string; problem: string; fix: string }
interface OpenQuestion { question: string; why_it_matters: string; owner: string }

interface Analysis {
  overall_score: number
  grade: string
  summary: string
  dimension_scores: DimensionScores
  gaps: Gap[]
  vague_items: VagueItem[]
  open_questions: OpenQuestion[]
  strengths: string[]
  quick_wins: string[]
}

interface Props { rawSpec: string; language: string }

const DIMENSION_LABELS: Record<string, string> = {
  clarity: 'Clarity',
  completeness: 'Completeness',
  testability: 'Testability',
  feasibility: 'Feasibility',
  edge_case_coverage: 'Edge case coverage',
}

function ScoreRing({ score, grade }: { score: number; grade: string }) {
  const r = 38; const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 80 ? '#1a6b5a' : score >= 60 ? '#c8471a' : score >= 40 ? '#ba7517' : '#a32d2d'
  return (
    <div className={styles.ring}>
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#e4dfd3" strokeWidth="7" />
        <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 48 48)" style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      </svg>
      <div className={styles.ringInner}>
        <span className={styles.ringScore} style={{ color }}>{score}</span>
        <span className={styles.ringGrade} style={{ color }}>{grade}</span>
      </div>
    </div>
  )
}

function DimBar({ label, score }: { label: string; score: number }) {
  const color = score >= 80 ? '#1a6b5a' : score >= 60 ? '#c8471a' : score >= 40 ? '#ba7517' : '#a32d2d'
  return (
    <div className={styles.dimRow}>
      <span className={styles.dimLabel}>{label}</span>
      <div className={styles.dimTrack}>
        <div className={styles.dimFill} style={{ width: `${score}%`, background: color }} />
      </div>
      <span className={styles.dimNum} style={{ color }}>{score}</span>
    </div>
  )
}

const SEV_COLOR: Record<string, string> = { critical: '#a32d2d', major: '#c8471a', minor: '#ba7517' }
const SEV_BG: Record<string, string> = { critical: '#fcebeb', major: '#faece7', minor: '#faeeda' }
const OWNER_COLOR: Record<string, string> = { PM: '#534AB7', Engineering: '#1a6b5a', Design: '#D4537E', Legal: '#a32d2d', Business: '#c8471a' }

export default function SpecAnalyser({ rawSpec, language }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'gaps' | 'vague' | 'questions' | 'strengths'>('gaps')

  const analyse = async () => {
    setLoading(true); setError(''); setAnalysis(null)
    try {
      const res = await fetch('/api/analyse-spec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spec: rawSpec, language }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setAnalysis(data.analysis)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally { setLoading(false) }
  }

  if (!open) {
    return (
      <div className={styles.trigger} onClick={() => setOpen(true)}>
        <div className={styles.triggerLeft}>
          <span className={styles.premiumBadge}>✦ Premium</span>
          <span className={styles.triggerTitle}>Spec Analyser</span>
          <span className={styles.triggerSub}>Score · gaps · vague items · open questions</span>
        </div>
        <span className={styles.triggerArrow}>→</span>
      </div>
    )
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <div className={styles.panelTitle}>
            <span className={styles.premiumBadge}>✦ Premium</span>
            <span>Spec Analyser</span>
          </div>
          <p className={styles.panelSub}>AI review of your spec for gaps, vagueness, and open questions</p>
        </div>
        <button className={styles.closeBtn} onClick={() => setOpen(false)}>×</button>
      </div>

      {!analysis && !loading && (
        <div className={styles.analysePrompt}>
          <p className={styles.analyseDesc}>Get a rigorous review of your spec across 5 dimensions with actionable fixes.</p>
          <button className={styles.analyseBtn} onClick={analyse}>Analyse spec →</button>
          {error && <div className={styles.err}>{error}</div>}
        </div>
      )}

      {loading && (
        <div className={styles.loadingState}>
          <div className={styles.dots}><span /><span /><span /></div>
          <p className={styles.loadText}>Reviewing spec...</p>
        </div>
      )}

      {analysis && (
        <div className={styles.results}>
          {/* Score header */}
          <div className={styles.scoreHeader}>
            <ScoreRing score={analysis.overall_score} grade={analysis.grade} />
            <div className={styles.scoreRight}>
              <p className={styles.summary}>{analysis.summary}</p>
              <div className={styles.dims}>
                {Object.entries(analysis.dimension_scores).map(([k, v]) => (
                  <DimBar key={k} label={DIMENSION_LABELS[k] || k} score={v} />
                ))}
              </div>
            </div>
          </div>

          {/* Quick wins */}
          <div className={styles.quickWins}>
            <div className={styles.qwLabel}>Top 3 quick wins</div>
            {analysis.quick_wins.map((w, i) => (
              <div key={i} className={styles.qwItem}>
                <span className={styles.qwNum}>{i + 1}</span>
                <span className={styles.qwText}>{w}</span>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className={styles.tabs}>
            {(['gaps', 'vague', 'questions', 'strengths'] as const).map(t => (
              <button key={t} className={`${styles.tab} ${activeTab === t ? styles.tabActive : ''}`} onClick={() => setActiveTab(t)}>
                {t === 'gaps' && `Gaps (${analysis.gaps.length})`}
                {t === 'vague' && `Vague (${analysis.vague_items.length})`}
                {t === 'questions' && `Open Qs (${analysis.open_questions.length})`}
                {t === 'strengths' && 'Strengths'}
              </button>
            ))}
          </div>

          {/* Gaps */}
          {activeTab === 'gaps' && (
            <div className={styles.tabContent}>
              {analysis.gaps.map((g, i) => (
                <div key={i} className={styles.gapItem} style={{ borderLeftColor: SEV_COLOR[g.severity] }}>
                  <div className={styles.gapTop}>
                    <span className={styles.sevBadge} style={{ background: SEV_BG[g.severity], color: SEV_COLOR[g.severity] }}>{g.severity}</span>
                    <span className={styles.gapSection}>{g.section}</span>
                  </div>
                  <p className={styles.gapIssue}>{g.issue}</p>
                  <div className={styles.gapFix}>
                    <span className={styles.fixLabel}>Suggestion</span>
                    <span className={styles.fixText}>{g.suggestion}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Vague items */}
          {activeTab === 'vague' && (
            <div className={styles.tabContent}>
              {analysis.vague_items.map((v, i) => (
                <div key={i} className={styles.vagueItem}>
                  <div className={styles.vagueQuote}>"{v.quote}"</div>
                  <p className={styles.vagueProblem}>{v.problem}</p>
                  <div className={styles.gapFix}>
                    <span className={styles.fixLabel}>Rewrite as</span>
                    <span className={styles.fixText}>{v.fix}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Open questions */}
          {activeTab === 'questions' && (
            <div className={styles.tabContent}>
              {analysis.open_questions.map((q, i) => (
                <div key={i} className={styles.questionItem}>
                  <div className={styles.questionTop}>
                    <span className={styles.ownerBadge} style={{ background: `${OWNER_COLOR[q.owner]}18`, color: OWNER_COLOR[q.owner], border: `1px solid ${OWNER_COLOR[q.owner]}40` }}>{q.owner}</span>
                  </div>
                  <p className={styles.questionText}>{q.question}</p>
                  <p className={styles.questionWhy}>Why it matters: {q.why_it_matters}</p>
                </div>
              ))}
            </div>
          )}

          {/* Strengths */}
          {activeTab === 'strengths' && (
            <div className={styles.tabContent}>
              {analysis.strengths.map((s, i) => (
                <div key={i} className={styles.strengthItem}>
                  <span className={styles.strengthCheck}>✓</span>
                  <span className={styles.strengthText}>{s}</span>
                </div>
              ))}
            </div>
          )}

          <button className={styles.rerunBtn} onClick={analyse}>Re-analyse ↺</button>
        </div>
      )}
    </div>
  )
}
