import { NextRequest, NextResponse } from 'next/server'
export async function POST(req: NextRequest) {
  const { spec, language } = await req.json()
  if (!spec?.trim()) return NextResponse.json({ error: 'Spec required' }, { status: 400 })
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  const lang = language && language !== 'English' ? ` Respond in ${language}.` : ''
  const system = `You are a principal PM and risk analyst. Identify specific risks in product specs. Respond ONLY with valid JSON, no preamble or fences.${lang}`
  const user = `Analyse this spec for risks. Return JSON:\n{"summary":"string","overall_risk":"low|medium|high|critical","risks":[{"category":"Technical|Legal|UX|Timeline|Business|Security|Privacy","title":"string","description":"string","severity":"low|medium|high|critical","probability":"low|medium|high","mitigation":"string","owner":"Engineering|PM|Legal|Design|Business"}],"top_3_to_address":["string","string","string"],"risk_score":0}\n\nFind 6-10 specific risks.\n\nSpec:\n---\n${spec}`
  const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 2500, system, messages: [{ role: 'user', content: user }] }) })
  const data = await res.json()
  if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 })
  const raw = data.content?.map((b: {type:string;text?:string}) => b.text||'').join('').replace(/```json\n?/g,'').replace(/```\n?/g,'').trim()
  try { return NextResponse.json({ result: JSON.parse(raw) }) } catch { return NextResponse.json({ error: 'Parse failed.' }, { status: 500 }) }
}
