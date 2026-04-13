import { NextRequest, NextResponse } from 'next/server'
export async function POST(req: NextRequest) {
  const { spec, language, memoryContext } = await req.json()
  if (!spec?.trim()) return NextResponse.json({ error: 'Spec is required' }, { status: 400 })
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
  const langNote = language && language !== 'English' ? ` Respond in ${language}.` : ''
  const memCtx = memoryContext ? `\nContext:\n${memoryContext}` : ''
  const system = `You are a principal PM and risk analyst. Return ONLY valid JSON, no markdown fences.${langNote}${memCtx}`
  const user = `Analyse this spec and produce a structured risk register:
${spec}

Return JSON:
{
  "risk_summary": "one paragraph executive summary of the risk profile",
  "overall_risk_level": "high|medium|low",
  "risks": [
    {
      "id": "R1",
      "category": "Technical|Legal|UX|Timeline|Business|Security|Data|Compliance",
      "title": "risk title",
      "description": "what could go wrong",
      "likelihood": "high|medium|low",
      "impact": "high|medium|low",
      "severity": "critical|major|moderate|minor",
      "triggers": ["what would cause this risk to materialise"],
      "mitigation": "how to prevent or reduce this risk",
      "contingency": "what to do if it happens",
      "owner": "PM|Engineering|Legal|Design|Business"
    }
  ],
  "top_3_priorities": ["most critical risk to address first", "second", "third"],
  "recommended_actions": [
    { "action": "specific action", "when": "before build|during build|at launch|post launch", "owner": "role" }
  ]
}`
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 3000, system, messages: [{ role: 'user', content: user }] }),
  })
  const data = await res.json()
  if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 })
  const raw = data.content?.map((b: {type:string;text?:string}) => b.text||'').join('').replace(/```json\n?/g,'').replace(/```\n?/g,'').trim()
  try { return NextResponse.json({ register: JSON.parse(raw) }) }
  catch { return NextResponse.json({ error: 'Failed to parse risk register.' }, { status: 500 }) }
}
