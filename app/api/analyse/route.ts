import { NextRequest, NextResponse } from 'next/server'
export async function POST(req: NextRequest) {
  const { csvContent, question, language, memoryContext } = await req.json()
  if (!csvContent?.trim()) return NextResponse.json({ error: 'CSV content is required' }, { status: 400 })
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
  const langInstruction = language && language !== 'English' ? ` Respond entirely in ${language}.` : ''
  const memCtx = memoryContext ? `\nUser context:\n${memoryContext}` : ''
  const system = `You are a senior product analyst. Analyse the CSV data and give PM-ready insights. Use ## sections. Be specific with numbers.${langInstruction}${memCtx}`
  const userPrompt = question
    ? `CSV data:\n\n${csvContent.slice(0, 8000)}\n\nQuestion: ${question}`
    : `CSV data:\n\n${csvContent.slice(0, 8000)}\n\nProvide:\n## Data summary\n## Key metrics\n## Patterns & trends\n## Anomalies\n## Top 3 PM recommendations`
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 3000, system, messages: [{ role: 'user', content: userPrompt }] }),
  })
  const data = await res.json()
  if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 })
  return NextResponse.json({ analysis: data.content?.map((b: { type: string; text?: string }) => b.text || '').join('') || '' })
}
