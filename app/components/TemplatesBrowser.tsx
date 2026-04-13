'use client'
import { useState } from 'react'
import styles from './TemplatesBrowser.module.css'
import {
  SPEC_TEMPLATES, DIAGRAM_TEMPLATES, TRANSLATE_TEMPLATES, CSV_TEMPLATES,
  type SpecTemplate, type DiagramTemplate, type TranslateTemplate, type CsvTemplate
} from '../data/templates'

type ToolType = 'spec' | 'diagram' | 'translate' | 'csv'

interface SpecProps { tool: 'spec'; onApply: (t: SpecTemplate) => void }
interface DiagramProps { tool: 'diagram'; onApply: (t: DiagramTemplate) => void }
interface TranslateProps { tool: 'translate'; onApply: (t: TranslateTemplate) => void }
interface CsvProps { tool: 'csv'; onApply: (t: CsvTemplate) => void }

type Props = SpecProps | DiagramProps | TranslateProps | CsvProps

function groupBy<T extends { category: string }>(items: T[]): Record<string, T[]> {
  return items.reduce((acc, item) => {
    acc[item.category] = [...(acc[item.category] || []), item]
    return acc
  }, {} as Record<string, T[]>)
}

export default function TemplatesBrowser(props: Props) {
  const [search, setSearch] = useState('')
  const [applied, setApplied] = useState<string | null>(null)

  const applyAndFlash = (id: string, cb: () => void) => {
    cb()
    setApplied(id)
    setTimeout(() => setApplied(null), 1500)
  }

  if (props.tool === 'spec') {
    const filtered = SPEC_TEMPLATES.filter(t =>
      !search || t.label.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase()) ||
      t.feature.toLowerCase().includes(search.toLowerCase())
    )
    const grouped = groupBy(filtered)
    return (
      <div className={styles.panel}>
        <div className={styles.searchRow}>
          <input className={styles.search} type="text" placeholder="Search templates..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className={styles.clearSearch} onClick={() => setSearch('')}>×</button>}
        </div>
        <div className={styles.list}>
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat} className={styles.group}>
              <div className={styles.catLabel}>{cat}</div>
              {items.map(t => (
                <div key={t.id} className={`${styles.item} ${applied === t.id ? styles.applied : ''}`}>
                  <div className={styles.itemTop}>
                    <span className={styles.itemIcon}>{t.icon}</span>
                    <div className={styles.itemMeta}>
                      <span className={styles.itemLabel}>{t.label}</span>
                      <div className={styles.itemTags}>
                        <span className={styles.itemTag}>{t.productType}</span>
                        <span className={styles.itemTag}>{t.primaryUser}</span>
                        {t.tag && <span className={styles.popularTag}>{t.tag}</span>}
                      </div>
                    </div>
                  </div>
                  <p className={styles.itemPreview}>{t.feature.slice(0, 110)}…</p>
                  <button
                    className={styles.applyBtn}
                    onClick={() => applyAndFlash(t.id, () => (props as SpecProps).onApply(t))}
                  >
                    {applied === t.id ? '✓ Applied' : 'Use template →'}
                  </button>
                </div>
              ))}
            </div>
          ))}
          {Object.keys(grouped).length === 0 && <p className={styles.empty}>No templates match "{search}"</p>}
        </div>
      </div>
    )
  }

  if (props.tool === 'diagram') {
    const filtered = DIAGRAM_TEMPLATES.filter(t =>
      !search || t.label.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
    )
    const grouped = groupBy(filtered)
    return (
      <div className={styles.panel}>
        <div className={styles.searchRow}>
          <input className={styles.search} type="text" placeholder="Search diagrams..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className={styles.clearSearch} onClick={() => setSearch('')}>×</button>}
        </div>
        <div className={styles.list}>
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat} className={styles.group}>
              <div className={styles.catLabel}>{cat}</div>
              {items.map(t => (
                <div key={t.id} className={`${styles.item} ${applied === t.id ? styles.applied : ''}`}>
                  <div className={styles.itemTop}>
                    <span className={styles.itemIcon}>{t.icon}</span>
                    <div className={styles.itemMeta}>
                      <span className={styles.itemLabel}>{t.label}</span>
                      <span className={styles.itemTag}>{t.diagramType}</span>
                    </div>
                  </div>
                  <p className={styles.itemPreview}>{t.description.slice(0, 100)}…</p>
                  <button
                    className={styles.applyBtn}
                    onClick={() => applyAndFlash(t.id, () => (props as DiagramProps).onApply(t))}
                  >
                    {applied === t.id ? '✓ Applied' : 'Use template →'}
                  </button>
                </div>
              ))}
            </div>
          ))}
          {Object.keys(grouped).length === 0 && <p className={styles.empty}>No templates match "{search}"</p>}
        </div>
      </div>
    )
  }

  if (props.tool === 'translate') {
    const filtered = TRANSLATE_TEMPLATES.filter(t =>
      !search || t.label.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
    )
    const grouped = groupBy(filtered)
    return (
      <div className={styles.panel}>
        <div className={styles.searchRow}>
          <input className={styles.search} type="text" placeholder="Search templates..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className={styles.clearSearch} onClick={() => setSearch('')}>×</button>}
        </div>
        <div className={styles.list}>
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat} className={styles.group}>
              <div className={styles.catLabel}>{cat}</div>
              {items.map(t => (
                <div key={t.id} className={`${styles.item} ${applied === t.id ? styles.applied : ''}`}>
                  <div className={styles.itemTop}>
                    <span className={styles.itemIcon}>{t.icon}</span>
                    <div className={styles.itemMeta}>
                      <span className={styles.itemLabel}>{t.label}</span>
                      <span className={styles.itemTag}>{t.category}</span>
                    </div>
                  </div>
                  <p className={styles.itemPreview}>{t.text.slice(0, 100)}…</p>
                  <button
                    className={styles.applyBtn}
                    onClick={() => applyAndFlash(t.id, () => (props as TranslateProps).onApply(t))}
                  >
                    {applied === t.id ? '✓ Applied' : 'Use template →'}
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (props.tool === 'csv') {
    const filtered = CSV_TEMPLATES.filter(t =>
      !search || t.label.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
    )
    const grouped = groupBy(filtered)
    return (
      <div className={styles.panel}>
        <div className={styles.searchRow}>
          <input className={styles.search} type="text" placeholder="Search sample data..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className={styles.clearSearch} onClick={() => setSearch('')}>×</button>}
        </div>
        <div className={styles.list}>
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat} className={styles.group}>
              <div className={styles.catLabel}>{cat}</div>
              {items.map(t => (
                <div key={t.id} className={`${styles.item} ${applied === t.id ? styles.applied : ''}`}>
                  <div className={styles.itemTop}>
                    <span className={styles.itemIcon}>{t.icon}</span>
                    <div className={styles.itemMeta}>
                      <span className={styles.itemLabel}>{t.label}</span>
                      <span className={styles.itemTag}>{t.category}</span>
                    </div>
                  </div>
                  <p className={styles.itemPreview}>{t.description}</p>
                  <button
                    className={styles.applyBtn}
                    onClick={() => applyAndFlash(t.id, () => (props as CsvProps).onApply(t))}
                  >
                    {applied === t.id ? '✓ Loaded' : 'Load sample data →'}
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return null
}
