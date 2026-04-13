import { NextRequest, NextResponse } from 'next/server'
export async function POST(req: NextRequest) {
  const { notes, language } = await req.json()
  if (!notes?.trim()) return NextResponse.json({ error: 'Notes required' }, { status: 400 })
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  const lang = language && language !== 'English' ? ` Respond in ${language}.` : ''
  const system = `You are a senior PM extracting structured outputs from messy meeting notes. Be precise. Use ## headings.${lang}`
  const user = `Extract from these notes:\n\n${notes}\n\n## Meeting summary\n## Decisions made\n## Action items (task, owner, due date, priority)\n## Open questions\n## Follow-ups needed`
  const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 2048, system, messages: [{ role: 'user', content: user }] }) })
  const data = await res.json()
  if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 })
  return NextResponse.json({ result: data.content?.map((b: {type:string;text?:string}) => b.text||'').join('') || '' })
}
