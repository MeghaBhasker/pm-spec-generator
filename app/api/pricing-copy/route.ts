import { NextRequest, NextResponse } from 'next/server'
export async function POST(req: NextRequest) {
  const { productName, tiers, audience, tone, language, memoryContext } = await req.json()
  if (!tiers?.trim()) return NextResponse.json({ error: 'Pricing tiers required' }, { status: 400 })
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
  const langNote = language && language !== 'English' ? ` Write in ${language}.` : ''
  const memCtx = memoryContext ? `\nProduct context:\n${memoryContext}` : ''
  const system = `You are a conversion copywriter specialising in SaaS pricing pages. Return ONLY valid JSON, no markdown fences.${langNote}${memCtx}`
  const user = `Write conversion-optimised pricing page copy for ${productName || 'the product'}.
Target audience: ${audience || 'developers and technical teams'}
Tone: ${tone || 'clear, confident, value-driven'}
Pricing tiers and features:
${tiers}

Return JSON:
{
  "headline": "main pricing page headline",
  "subheadline": "supporting line",
  "value_statement": "one compelling sentence about the value",
  "tiers": [
    {
      "name": "tier name",
      "tagline": "one-line description of who it's for",
      "price_display": "price or 'Free' or 'Custom'",
      "cta_text": "button copy",
      "cta_subtext": "small text below button (e.g. 'No credit card required')",
      "features": ["feature 1 written as user benefit", "feature 2"],
      "recommended": true/false,
      "recommended_label": "Most popular / Best value / etc (only if recommended)"
    }
  ],
  "faq": [
    { "question": "common pricing question", "answer": "clear answer" }
  ],
  "social_proof_prompt": "suggested type of social proof to add here",
  "comparison_cta": "text encouraging users to compare plans"
}`
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 2500, system, messages: [{ role: 'user', content: user }] }),
  })
  const data = await res.json()
  if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 })
  const raw = data.content?.map((b: {type:string;text?:string}) => b.text||'').join('').replace(/```json\n?/g,'').replace(/```\n?/g,'').trim()
  try { return NextResponse.json({ copy: JSON.parse(raw) }) }
  catch { return NextResponse.json({ error: 'Failed to parse pricing copy.' }, { status: 500 }) }
}
