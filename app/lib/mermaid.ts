declare global {
  interface Window {
    mermaid: {
      initialize: (config: object) => void
      render: (id: string, text: string) => Promise<{ svg: string }>
    }
  }
}

export async function loadMermaid(): Promise<Window['mermaid'] | null> {
  if (typeof window === 'undefined') return null

  await new Promise<void>((resolve, reject) => {
    if (window.mermaid) { resolve(); return }
    const existing = document.getElementById('mermaid-script')
    if (existing) { resolve(); return }
    const script = document.createElement('script')
    script.id = 'mermaid-script'
    script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load mermaid'))
    document.head.appendChild(script)
  })

  window.mermaid.initialize({ startOnLoad: false, theme: 'neutral', fontFamily: 'DM Mono, monospace' })
  return window.mermaid
}

