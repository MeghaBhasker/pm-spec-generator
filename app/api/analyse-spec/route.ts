import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { spec, language } = await req.json()
  if (!spec?.trim()) return NextResponse.json({ error: 'Spec is required' }, { status: 400 })
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })

  const langNote = language && language !== 'English' ? ` Respond in ${language}.` : ''

  const system = `You are a principal PM and spec reviewer. You review functional specs with extreme rigour. Your job is to find every gap, ambiguity, vague claim, missing edge case, and open question — then score the spec.${langNote}

You MUST respond with valid JSON only. No preamble, no markdown fences, just raw JSON.`

  const user = `Analyse this functional spec and return a JSON object with exactly this structure:

{
  "overall_score": <number 0-100>,
  "grade": <"A"|"B"|"C"|"D"|"F">,
  "summary": <one sentence verdict>,
  "dimension_scores": {
    "clarity": <0-100>,
    "completeness": <0-100>,
    "testability": <0-100>,
    "feasibility": <0-100>,
    "edge_case_coverage": <0-100>
  },
  "gaps": [
    { "severity": <"critical"|"major"|"minor">, "section": <string>, "issue": <string>, "suggestion": <string> }
  ],
  "vague_items": [
    { "quote": <exact quote from spec, max 80 chars>, "problem": <why it's vague>, "fix": <concrete rewrite suggestion> }
  ],
  "open_questions": [
    { "question": <string>, "why_it_matters": <string>, "owner": <"PM"|"Engineering"|"Design"|"Legal"|"Business"> }
  ],
  "strengths": [<string>, <string>, <string>],
  "quick_wins": [<string>, <string>, <string>]
}

Gaps: find 3-8 real gaps. Be specific about which section and exactly what's missing.
Vague items: find 3-6 quotes that are ambiguous, unmeasurable, or undefined. Quote exact text.
Open questions: find 3-6 questions that must be answered before engineering starts.
Strengths: 3 things genuinely done well.
Quick wins: 3 fast improvements that would most improve the score.

Spec to analyse:
---
${spec}`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-opus-4-5',
      max_tokens: 3000,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  })

  const data = await res.json()
  if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 })

  const raw = data.content?.map((b: { type: string; text?: string }) => b.text || '').join('') || ''

  try {
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(clean)
    return NextResponse.json({ analysis: parsed })
  } catch {
    return NextResponse.json({ error: 'Failed to parse analysis. Try again.' }, { status: 500 })
  }
}
