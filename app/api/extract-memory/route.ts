import { NextRequest, NextResponse } from 'next/server'
export async function POST(req: NextRequest) {
  const { content, filename } = await req.json()
  if (!content?.trim()) return NextResponse.json({ memory: {} })
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ memory: {} })
  const system = `You are extracting PM context from a document. Return ONLY valid JSON with these optional fields if found: name, title, company, industry, experience, team_size, product_name, product_type, core_problem, tech_stack, primary_user, user_pain, north_star, key_competitors. Return {} if nothing relevant found. No preamble, no fences.`
  const user = `Extract PM context from this document (${filename}):\n\n${content.slice(0, 6000)}`
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 800, system, messages: [{ role: 'user', content: user }] })
  })
  const data = await res.json()
  const raw = data.content?.map((b: {type:string;text?:string}) => b.text||'').join('').replace(/```json\n?/g,'').replace(/```\n?/g,'').trim()
  try { return NextResponse.json({ memory: JSON.parse(raw) }) } catch { return NextResponse.json({ memory: {} }) }
}
