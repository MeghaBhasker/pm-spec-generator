import { NextRequest, NextResponse } from 'next/server'
export async function POST(req: NextRequest) {
  const { specA, specB, labelA, labelB, language } = await req.json()
  if (!specA?.trim() || !specB?.trim()) return NextResponse.json({ error: 'Both specs required' }, { status: 400 })
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
  const langNote = language && language !== 'English' ? ` Respond in ${language}.` : ''
  const system = `You are a senior PM comparing two versions of a functional spec. Return ONLY valid JSON, no markdown fences.${langNote}`
  const user = `Compare these two spec versions and produce a structured diff analysis.

${labelA || 'Version A'}:
---
${specA}
---

${labelB || 'Version B'}:
---
${specB}
---

Return JSON:
{
  "summary": "2-3 sentence summary of what changed and whether it's an improvement",
  "overall_verdict": "improved|similar|worse",
  "verdict_reason": "why",
  "changes": [
    {
      "type": "added|removed|modified|strengthened|weakened",
      "section": "which section",
      "description": "what changed",
      "impact": "why this matters",
      "recommendation": "keep|revert|refine"
    }
  ],
  "score_delta": {
    "clarity": "+5 or -3 etc",
    "completeness": "",
    "testability": "",
    "edge_cases": ""
  },
  "what_got_better": ["item 1", "item 2"],
  "what_got_worse": ["item 1"],
  "recommendation": "final recommendation paragraph"
}`
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 2500, system, messages: [{ role: 'user', content: user }] }),
  })
  const data = await res.json()
  if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 })
  const raw = data.content?.map((b: {type:string;text?:string}) => b.text||'').join('').replace(/```json\n?/g,'').replace(/```\n?/g,'').trim()
  try { return NextResponse.json({ diff: JSON.parse(raw) }) }
  catch { return NextResponse.json({ error: 'Failed to parse diff.' }, { status: 500 }) }
}
