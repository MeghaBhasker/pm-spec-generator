import { NextRequest, NextResponse } from 'next/server'
export async function POST(req: NextRequest) {
  const { input, version, audience, language } = await req.json()
  if (!input?.trim()) return NextResponse.json({ error: 'Input required' }, { status: 400 })
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  const lang = language && language !== 'English' ? ` Write in ${language}.` : ''
  const system = `You are a technical writer turning engineering changes into polished user-facing release notes. Be clear, benefit-focused, and human. Use ## headings.${lang}`
  const user = `Write polished release notes for version ${version||'latest'} aimed at ${audience||'developers and end users'}.\n\nChanges/features:\n${input}\n\n## What's new (headline features, benefit-first)\n## Improvements (enhancements to existing features)\n## Bug fixes (brief, user-impact framing)\n## Breaking changes (if any — migration guidance)\n## Coming soon (1-2 teaser items if relevant)`
  const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 2048, system, messages: [{ role: 'user', content: user }] }) })
  const data = await res.json()
  if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 })
  return NextResponse.json({ result: data.content?.map((b: {type:string;text?:string}) => b.text||'').join('') || '' })
}
