import { NextRequest, NextResponse } from 'next/server'
export async function POST(req: NextRequest) {
  const { oneliner, audience, memoryContext, language } = await req.json()
  if (!oneliner?.trim()) return NextResponse.json({ error: 'One-liner required' }, { status: 400 })
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  const lang = language && language !== 'English' ? ` Write in ${language}.` : ''
  const mem = memoryContext ? `\nProduct context:\n${memoryContext}` : ''
  const system = `You are a principal PM writing a complete PRD for exec and engineering review. Be specific and strategic. Use ## headings. No filler.${lang}${mem}`
  const user = `Write a full PRD for: "${oneliner}"\nAudience: ${audience||'exec + engineering'}\n\nSections: ## Executive summary, ## Problem statement, ## Goals & success metrics, ## User personas, ## In scope, ## Out of scope, ## Solution overview, ## Key user flows, ## Functional requirements, ## Non-functional requirements, ## Dependencies & risks, ## Timeline & milestones, ## Open questions`
  const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 4096, system, messages: [{ role: 'user', content: user }] }) })
  const data = await res.json()
  if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 })
  return NextResponse.json({ result: data.content?.map((b: {type:string;text?:string}) => b.text||'').join('') || '' })
}
