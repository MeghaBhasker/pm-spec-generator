import { NextRequest, NextResponse } from 'next/server'
export async function POST(req: NextRequest) {
  const { product, goal, constraints, language, memoryContext } = await req.json()
  if (!product?.trim()) return NextResponse.json({ error: 'Product description required' }, { status: 400 })
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
  const langNote = language && language !== 'English' ? ` Respond in ${language}.` : ''
  const memCtx = memoryContext ? `\nUser/product context:\n${memoryContext}` : ''
  const system = `You are a creative yet rigorous PM generating high-quality feature ideas. Return ONLY valid JSON, no markdown fences.${langNote}${memCtx}`
  const user = `Generate feature ideas for: ${product}
Goal: ${goal || 'grow engagement and retention'}
Constraints: ${constraints || 'small team, 2-week sprints'}

Return JSON:
{
  "product_summary": "one line about the product",
  "features": [
    {
      "id": "F1",
      "title": "feature name",
      "tagline": "one-line description",
      "problem_solved": "what user pain this addresses",
      "user_story": "As a [user], I want [action] so that [benefit]",
      "category": "Growth|Retention|Monetisation|DX|Core|Infrastructure|Delight",
      "effort": "small|medium|large",
      "impact": "high|medium|low",
      "confidence": "high|medium|low",
      "reach": "% of users affected",
      "rice_score": number,
      "dependencies": ["what needs to exist first"],
      "risks": ["main risk"],
      "success_metric": "how you'd measure it",
      "similar_in_wild": "product that does something similar"
    }
  ],
  "themes": [
    { "theme": "theme name", "feature_ids": ["F1", "F3"], "rationale": "why these go together" }
  ],
  "recommended_sequence": ["F3", "F1", "F5"],
  "sequence_rationale": "why this order makes sense"
}

Generate 8-10 features. RICE score = (Reach × Impact × Confidence) / Effort. Be creative but realistic. Mix quick wins with bigger bets.`
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 4000, system, messages: [{ role: 'user', content: user }] }),
  })
  const data = await res.json()
  if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 })
  const raw = data.content?.map((b: {type:string;text?:string}) => b.text||'').join('').replace(/```json\n?/g,'').replace(/```\n?/g,'').trim()
  try { return NextResponse.json({ ideas: JSON.parse(raw) }) }
  catch { return NextResponse.json({ error: 'Failed to parse ideas.' }, { status: 500 }) }
}
