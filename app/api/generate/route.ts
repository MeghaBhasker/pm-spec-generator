import { NextRequest, NextResponse } from 'next/server'
export async function POST(req: NextRequest) {
  const { feature, productType, primaryUser, sections, template, language, memoryContext } = await req.json()
  if (!feature?.trim()) return NextResponse.json({ error: 'Feature description is required' }, { status: 400 })
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
  const langInstruction = language && language !== 'English' ? `\n\nIMPORTANT: Write the entire spec in ${language}. All headings, content, and examples must be in ${language}.` : ''
  const memCtx = memoryContext ? `\n\nUser context (use to personalise the spec):\n${memoryContext}` : ''
  const system = `You are a senior PM writing a detailed functional spec. Format with ## headings. Use numbered lists for requirements. Write Given/When/Then for acceptance criteria. Be thorough on edge cases. No filler.${template ? ` Use "${template}" product conventions.` : ''}${langInstruction}${memCtx}`
  const user = `Product type: ${productType}\nPrimary user: ${primaryUser || 'end user'}\nFeature: ${feature}\n\nSections:\n${sections.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}`
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 4096, system, messages: [{ role: 'user', content: user }] }),
  })
  const data = await res.json()
  if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 })
  return NextResponse.json({ spec: data.content?.map((b: { type: string; text?: string }) => b.text || '').join('') || '' })
}
