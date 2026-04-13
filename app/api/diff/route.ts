import { NextRequest, NextResponse } from 'next/server'
export async function POST(req: NextRequest) {
  const { specA, specB, language } = await req.json()
  if (!specA?.trim()||!specB?.trim()) return NextResponse.json({ error: 'Both specs required' }, { status: 400 })
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  const lang = language && language !== 'English' ? ` Respond in ${language}.` : ''
  const system = `You are a senior PM reviewing changes between two spec versions. Respond ONLY with valid JSON.${lang}`
  const user = `Compare specs. Return JSON:\n{"summary":"string","change_magnitude":"minor|moderate|major","changes":[{"type":"added|removed|modified|clarified","section":"string","description":"string","impact":"low|medium|high","verdict":"improvement|regression|neutral"}],"net_assessment":"string","regressions":["string"],"improvements":["string"]}\n\nSpec A:\n---\n${specA.slice(0,3000)}\n\nSpec B:\n---\n${specB.slice(0,3000)}`
  const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 2000, system, messages: [{ role: 'user', content: user }] }) })
  const data = await res.json()
  if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 })
  const raw = data.content?.map((b: {type:string;text?:string}) => b.text||'').join('').replace(/```json\n?/g,'').replace(/```\n?/g,'').trim()
  try { return NextResponse.json({ result: JSON.parse(raw) }) } catch { return NextResponse.json({ error: 'Parse failed.' }, { status: 500 }) }
}
