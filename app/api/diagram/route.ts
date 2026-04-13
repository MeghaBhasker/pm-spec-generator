import { NextRequest, NextResponse } from 'next/server'
export async function POST(req: NextRequest) {
  const { description, diagramType, language } = await req.json()
  if (!description?.trim()) return NextResponse.json({ error: 'Description is required' }, { status: 400 })
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
  const langNote = language && language !== 'English' ? ` Label nodes in ${language}.` : ''

  const system = `You are an expert Mermaid diagram creator. Return ONLY valid Mermaid syntax — no explanation, no markdown fences, no preamble. Just raw Mermaid code starting with the diagram type keyword.

COLOUR CODING RULES — always apply these styles:
- UI screens / pages: style nodeId fill:#7C3AED,color:#fff,stroke:#5B21B6
- User actions / buttons: style nodeId fill:#2563EB,color:#fff,stroke:#1D4ED8
- System / backend processes: style nodeId fill:#D97706,color:#fff,stroke:#B45309
- Success / completion states: style nodeId fill:#059669,color:#fff,stroke:#047857
- Error / warning / alert states: style nodeId fill:#DC2626,color:#fff,stroke:#B91C1C
- Data stores / databases: style nodeId fill:#0891B2,color:#fff,stroke:#0E7490
- Decision points: use {rhombus shape} and style fill:#6B7280,color:#fff,stroke:#4B5563
- Entry/exit points: style nodeId fill:#111827,color:#fff,stroke:#111827

GROUP nodes into subgraphs by functional area with descriptive labels.
Use decision diamonds {text} for any branch points.
Add directional labels on arrows where useful (e.g. -->|yes| or -->|error|).
Make diagrams rich, detailed and production-quality — not minimal.${langNote}`

  const user = `Create a detailed ${diagramType} diagram for: ${description}

Apply colour coding by node type (screens=purple, actions=blue, system=amber, success=green, errors=red, data=cyan, decisions=gray).
Group related nodes into labelled subgraphs.
Include decision diamonds for any branch points.
Return only the Mermaid syntax.`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 3000, system, messages: [{ role: 'user', content: user }] }),
  })
  const data = await res.json()
  if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 })
  const mermaid = data.content?.map((b: { type: string; text?: string }) => b.text || '').join('').replace(/```mermaid\n?/g, '').replace(/```\n?/g, '').trim()
  return NextResponse.json({ mermaid })
}
