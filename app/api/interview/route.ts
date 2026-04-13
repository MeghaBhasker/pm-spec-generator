import { NextRequest, NextResponse } from 'next/server'
export async function POST(req: NextRequest) {
  const { role, focus, memoryContext, language } = await req.json()
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  const lang = language && language !== 'English' ? ` Respond in ${language}.` : ''
  const mem = memoryContext ? `\nCandidate context:\n${memoryContext}` : ''
  const system = `You are a senior PM interviewer. Generate rigorous tailored PM interview questions with detailed guidance.${lang}${mem}`
  const user = `PM interview question bank for: ${role||'Platform PM'}\nFocus: ${focus||'strategy, execution, metrics, leadership, technical depth'}\n\n## Strategy & vision (5 questions + what good looks like)\n## Product execution (5 questions)\n## Metrics & analytics (4 questions)\n## Cross-functional leadership (4 questions)\n## Technical depth (4 questions)\n## Behavioural / STAR (4 questions)\n## Questions to ask interviewers (5 strong ones)`
  const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 3000, system, messages: [{ role: 'user', content: user }] }) })
  const data = await res.json()
  if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 })
  return NextResponse.json({ result: data.content?.map((b: {type:string;text?:string}) => b.text||'').join('') || '' })
}
