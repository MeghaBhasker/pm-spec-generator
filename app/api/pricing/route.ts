import { NextRequest, NextResponse } from 'next/server'
export async function POST(req: NextRequest) {
  const { product, tiers, audience, language } = await req.json()
  if (!product?.trim()) return NextResponse.json({ error: 'Product required' }, { status: 400 })
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  const lang = language && language !== 'English' ? ` Write in ${language}.` : ''
  const system = `You are a conversion copywriter for SaaS pricing pages. Write clear benefit-led copy. Use ## headings.${lang}`
  const user = `Pricing page for: ${product}\nTiers: ${tiers}\nAudience: ${audience||'developers and business users'}\n\n## Page headline + subheadline\n## Tier names and positioning\n## For each tier: tagline, price placeholder, feature bullets, CTA, ideal customer\n## FAQ (5 questions)\n## Upgrade nudge copy\n## Annual vs monthly toggle copy`
  const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 3000, system, messages: [{ role: 'user', content: user }] }) })
  const data = await res.json()
  if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 })
  return NextResponse.json({ result: data.content?.map((b: {type:string;text?:string}) => b.text||'').join('') || '' })
}
