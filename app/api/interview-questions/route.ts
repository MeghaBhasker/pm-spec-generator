import { NextRequest, NextResponse } from 'next/server'
export async function POST(req: NextRequest) {
  const { role, company, focus, language, memoryContext } = await req.json()
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
  const langNote = language && language !== 'English' ? ` Respond in ${language}.` : ''
  const system = `You are a senior PM and hiring manager generating tailored PM interview questions. Return ONLY valid JSON, no markdown fences.${langNote}`
  const user = `Generate a tailored PM interview question bank.
Role: ${role || 'Platform PM'}
Company/product: ${company || 'B2B SaaS'}
Focus areas: ${focus || 'API platform, developer experience, AI products'}
Candidate context: ${memoryContext || 'Experienced PM with technical background'}

Return JSON:
{
  "categories": [
    {
      "name": "category name",
      "icon": "emoji",
      "questions": [
        {
          "question": "the interview question",
          "what_they_test": "what skill/quality this reveals",
          "strong_answer_signals": ["signal 1", "signal 2"],
          "red_flags": ["red flag 1"],
          "difficulty": "easy|medium|hard",
          "type": "behavioral|situational|technical|strategic"
        }
      ]
    }
  ]
}

Categories to include: Product Strategy, Prioritisation & Tradeoffs, Technical Depth, Execution & Delivery, Data & Metrics, Stakeholder Management, Leadership & Influence, Role-Specific (tailored to the role/company above).
3-4 questions per category. Make questions specific to the role and company context.`
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 4000, system, messages: [{ role: 'user', content: user }] }),
  })
  const data = await res.json()
  if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 })
  const raw = data.content?.map((b: {type:string;text?:string}) => b.text||'').join('').replace(/```json\n?/g,'').replace(/```\n?/g,'').trim()
  try { return NextResponse.json({ bank: JSON.parse(raw) }) }
  catch { return NextResponse.json({ error: 'Failed to parse question bank.' }, { status: 500 }) }
}
