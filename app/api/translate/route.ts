import { NextRequest, NextResponse } from 'next/server'
export async function POST(req: NextRequest) {
  const { text, targetLanguage, sourceLanguage, mode } = await req.json()
  if (!text?.trim()) return NextResponse.json({ error: 'Text is required' }, { status: 400 })
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
  const system = mode === 'explain'
    ? `You are a helpful translator and explainer. First translate the text to ${targetLanguage}, then provide a clear explanation of the content in ${targetLanguage} in simple terms. Format with ## Translation and ## Explanation sections.`
    : `You are a professional translator. Translate the text accurately from ${sourceLanguage || 'auto-detected language'} to ${targetLanguage}. Preserve formatting, tone, and structure. Return only the translation — no explanations or preamble.`
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 4096, system, messages: [{ role: 'user', content: text }] }),
  })
  const data = await res.json()
  if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 })
  return NextResponse.json({ result: data.content?.map((b: { type: string; text?: string }) => b.text || '').join('') || '' })
}
