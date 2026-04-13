import { NextRequest, NextResponse } from 'next/server'
export async function POST(req: NextRequest) {
  const { notes, language, memoryContext } = await req.json()
  if (!notes?.trim()) return NextResponse.json({ error: 'Meeting notes required' }, { status: 400 })
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
  const langNote = language && language !== 'English' ? ` Respond in ${language}.` : ''
  const memCtx = memoryContext ? `\nContext:\n${memoryContext}` : ''
  const system = `You are a senior PM distilling meeting notes into structured outputs. Return ONLY valid JSON, no markdown fences.${langNote}${memCtx}`
  const user = `Extract structured output from these meeting notes:

${notes}

Return JSON:
{
  "meeting_title": "inferred title",
  "date": "date if mentioned, else null",
  "attendees": ["name or role"],
  "summary": "2-3 sentence summary",
  "decisions": [{ "decision": "what was decided", "rationale": "why" }],
  "action_items": [{ "task": "what needs to happen", "owner": "who", "due_date": "when if mentioned", "priority": "high|medium|low" }],
  "open_questions": [{ "question": "unresolved question", "owner": "who should answer" }],
  "risks_flagged": ["any risks or concerns mentioned"],
  "next_meeting": "next meeting details if mentioned"
}`
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 2000, system, messages: [{ role: 'user', content: user }] }),
  })
  const data = await res.json()
  if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 })
  const raw = data.content?.map((b: {type:string;text?:string}) => b.text||'').join('').replace(/```json\n?/g,'').replace(/```\n?/g,'').trim()
  try { return NextResponse.json({ result: JSON.parse(raw) }) }
  catch { return NextResponse.json({ error: 'Failed to parse result.' }, { status: 500 }) }
}
