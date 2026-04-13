import { NextRequest, NextResponse } from 'next/server'
export async function POST(req: NextRequest) {
  const { messages, spec, language } = await req.json()
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
  const langInstruction = language && language !== 'English' ? ` Respond in ${language}.` : ''
  const system = `You are a senior PM helping refine a functional spec.${langInstruction} Current spec:\n---\n${spec}\n---\nWhen rewriting sections return the FULL updated spec with ## headings. For questions respond concisely.`
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 4096, system, messages }),
  })
  const data = await res.json()
  if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 })
  return NextResponse.json({ reply: data.content?.map((b: { type: string; text?: string }) => b.text || '').join('') || '' })
}
