import { NextRequest, NextResponse } from 'next/server'
export async function POST(req: NextRequest) {
  const { product, goal, language, memoryContext } = await req.json()
  if (!product?.trim()) return NextResponse.json({ error: 'Product description required' }, { status: 400 })
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
  const langNote = language && language !== 'English' ? ` All text in ${language}.` : ''
  const memCtx = memoryContext ? `\nContext:\n${memoryContext}` : ''
  const system = `You are a PM creating a user story map. Return ONLY valid JSON, no markdown fences, no preamble.${langNote}${memCtx}`
  const user = `Create a user story map for: ${product}${goal ? `\nUser goal: ${goal}` : ''}

Return JSON with this exact structure:
{
  "goal": "the overarching user goal",
  "epics": [
    {
      "id": "E1",
      "title": "epic title",
      "description": "one line",
      "priority": "must-have|should-have|nice-to-have",
      "stories": [
        {
          "id": "E1S1",
          "title": "As a [user], I want [action] so that [benefit]",
          "points": 3,
          "priority": "must-have|should-have|nice-to-have",
          "tasks": ["task 1", "task 2", "task 3"]
        }
      ]
    }
  ]
}

Create 3-5 epics, 2-4 stories per epic, 2-4 tasks per story. Be specific and realistic.`
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 3000, system, messages: [{ role: 'user', content: user }] }),
  })
  const data = await res.json()
  if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 })
  const raw = data.content?.map((b: {type:string;text?:string}) => b.text||'').join('').replace(/```json\n?/g,'').replace(/```\n?/g,'').trim()
  try { return NextResponse.json({ map: JSON.parse(raw) }) }
  catch { return NextResponse.json({ error: 'Failed to parse story map.' }, { status: 500 }) }
}
