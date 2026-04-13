import { NextRequest, NextResponse } from 'next/server'
export async function POST(req: NextRequest) {
  const { tool, context, language, memoryContext } = await req.json()
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
  const langNote = language && language !== 'English' ? ` Respond in ${language}.` : ''
  const memCtx = memoryContext ? `\nUser context:\n${memoryContext}` : ''
  const system = `You are a PM expert generating high-quality, reusable prompts for product management work. Return ONLY valid JSON, no markdown fences.${langNote}${memCtx}`
  const user = `Generate a curated prompt library for: ${tool || 'all PM tasks'}
Context: ${context || 'general product management'}

Return JSON:
{
  "categories": [
    {
      "name": "category name",
      "prompts": [
        {
          "id": "P1",
          "title": "prompt title",
          "description": "what this prompt is for",
          "prompt": "the full reusable prompt text with [PLACEHOLDERS] for customisation",
          "variables": ["PLACEHOLDER1 — description", "PLACEHOLDER2 — description"],
          "best_for": "when to use this",
          "example_output": "brief example of what it produces"
        }
      ]
    }
  ]
}

Include categories: Discovery & Research, Prioritisation, Spec Writing, Stakeholder Communication, Data Analysis, Strategy, AI & Product. 3-4 prompts per category.`
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 4000, system, messages: [{ role: 'user', content: user }] }),
  })
  const data = await res.json()
  if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 })
  const raw = data.content?.map((b: {type:string;text?:string}) => b.text||'').join('').replace(/```json\n?/g,'').replace(/```\n?/g,'').trim()
  try { return NextResponse.json({ library: JSON.parse(raw) }) }
  catch { return NextResponse.json({ error: 'Failed to parse library.' }, { status: 500 }) }
}
