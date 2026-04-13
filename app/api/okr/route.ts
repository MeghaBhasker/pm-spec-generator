import { NextRequest, NextResponse } from 'next/server'
export async function POST(req: NextRequest) {
  const { focus, timeframe, memoryContext, language } = await req.json()
  if (!focus?.trim()) return NextResponse.json({ error: 'Focus areas required' }, { status: 400 })
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  const lang = language && language !== 'English' ? ` Respond in ${language}.` : ''
  const mem = memoryContext ? `\nProduct context:\n${memoryContext}` : ''
  const system = `You are a PM coach writing well-formed OKRs. Each objective must be qualitative and inspiring. Each key result must be measurable with a baseline, target, and timeframe. Use ## headings.${lang}${mem}`
  const user = `Write OKRs for a ${timeframe||'quarterly'} cycle.\n\nFocus areas: ${focus}\n\nFor each focus area provide:\n- 1 Objective (qualitative, aspirational)\n- 3-4 Key Results (measurable: from X to Y by [date])\n- 2-3 Leading indicators to track weekly\n- 1 potential risk or dependency\n\nAlso provide a ## North star check — how do these OKRs ladder up to a long-term vision?`
  const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 2048, system, messages: [{ role: 'user', content: user }] }) })
  const data = await res.json()
  if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 })
  return NextResponse.json({ result: data.content?.map((b: {type:string;text?:string}) => b.text||'').join('') || '' })
}
