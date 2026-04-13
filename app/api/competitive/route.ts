import { NextRequest, NextResponse } from 'next/server'
export async function POST(req: NextRequest) {
  const { product, competitors, dimensions, language } = await req.json()
  if (!product?.trim()) return NextResponse.json({ error: 'Product required' }, { status: 400 })
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  const lang = language && language !== 'English' ? ` Respond in ${language}.` : ''
  const system = `You are a senior PM and market analyst. Write structured, specific competitive analysis. Use ## headings and comparison tables where useful.${lang}`
  const user = `Competitive analysis for: ${product}\nVs. competitors: ${competitors}\nFocus dimensions: ${dimensions||'pricing, features, DX, target market, positioning'}\n\n## Competitive landscape overview\n## Feature comparison matrix (table)\n## Pricing & packaging comparison\n## Target customer comparison\n## Our strengths vs each competitor\n## Our gaps vs each competitor\n## Positioning opportunities\n## Recommended differentiation strategy`
  const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 3000, system, messages: [{ role: 'user', content: user }] }) })
  const data = await res.json()
  if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 })
  return NextResponse.json({ result: data.content?.map((b: {type:string;text?:string}) => b.text||'').join('') || '' })
}
