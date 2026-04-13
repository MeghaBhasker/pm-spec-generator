'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import styles from './page.module.css'
import SpecAnalyser from './components/SpecAnalyser'
import { useI18n, SUPPORTED_LANGUAGES } from './lib/i18n'
import type { SpecTemplate, DiagramTemplate, CsvTemplate } from './data/templates'

type ToolId = 'memory'|'spec'|'prd'|'meeting'|'okr'|'competitive'|'interview'|'changelog'|'pricing'|'risk'|'diff'|'diagram'|'csv'|'prompts'|'history'
interface Message { role:'user'|'assistant'; content:string }
interface OutputTab { id:string; tool:ToolId; title:string; content:string; raw:string; createdAt:Date }
interface HistoryEntry { id:string; tool:ToolId; title:string; content:string; createdAt:Date }
interface Prompt { id:string; tool:ToolId; title:string; prompt:string; createdAt:Date }

const TOOLS: {id:ToolId;icon:string;label:string}[] = [
  {id:'memory',icon:'🧠',label:'Memory'},{id:'spec',icon:'📝',label:'Spec'},{id:'prd',icon:'📄',label:'PRD'},
  {id:'meeting',icon:'📋',label:'Meeting'},{id:'okr',icon:'🎯',label:'OKR'},{id:'competitive',icon:'🥊',label:'Competitive'},
  {id:'interview',icon:'🎤',label:'Interview'},{id:'changelog',icon:'🚢',label:'Changelog'},{id:'pricing',icon:'💰',label:'Pricing'},
  {id:'risk',icon:'🚨',label:'Risk'},{id:'diff',icon:'🔀',label:'Diff'},{id:'diagram',icon:'↗',label:'Diagram'},
  {id:'csv',icon:'📊',label:'CSV'},{id:'prompts',icon:'💾',label:'Prompts'},{id:'history',icon:'🕐',label:'History'},
]

const SECTIONS = [
  {id:'overview',label:'Overview',default:true},{id:'stories',label:'User stories',default:true},
  {id:'functional',label:'Functional reqs',default:true},{id:'acceptance',label:'Acceptance criteria',default:true},
  {id:'edge',label:'Edge cases',default:true},{id:'qa',label:'QA scenarios',default:true},
  {id:'nonfunctional',label:'Non-functional',default:false},{id:'outofscope',label:'Out of scope',default:false},
  {id:'openquestions',label:'Open questions',default:false},{id:'metrics',label:'Metrics',default:false},
]

const MEMORY_SECTIONS = [
  {id:'role',title:'Your role',icon:'👤',questions:[
    {id:'name',label:'Your name',placeholder:'e.g. Megha',type:'text'},
    {id:'title',label:'Job title',placeholder:'e.g. Platform PM',type:'text'},
    {id:'company',label:'Company',placeholder:'e.g. EarthDefine',type:'text'},
    {id:'industry',label:'Industry',placeholder:'e.g. Geospatial',type:'text'},
    {id:'experience',label:'Years PM experience',placeholder:'e.g. 3',type:'text'},
    {id:'team_size',label:'Team size',placeholder:'e.g. 5–10',type:'text'},
  ]},
  {id:'product',title:'Your product',icon:'🛠',questions:[
    {id:'product_name',label:'Product name',placeholder:'e.g. Buildings API',type:'text'},
    {id:'product_type',label:'Product type',placeholder:'e.g. B2B API',type:'text'},
    {id:'core_problem',label:'Core problem',placeholder:'e.g. Geocoding at scale',type:'textarea'},
    {id:'tech_stack',label:'Tech stack',placeholder:'e.g. NestJS, Docker',type:'text'},
  ]},
  {id:'users',title:'Your users',icon:'🎯',questions:[
    {id:'primary_user',label:'Primary persona',placeholder:'e.g. API developer',type:'text'},
    {id:'user_pain',label:'Biggest pain point',placeholder:'e.g. slow time-to-first-call',type:'textarea'},
  ]},
  {id:'goals',title:'Goals & metrics',icon:'📈',questions:[
    {id:'north_star',label:'North star metric',placeholder:'e.g. Monthly API calls',type:'text'},
    {id:'key_competitors',label:'Key competitors',placeholder:'e.g. Google Maps API',type:'text'},
  ]},
]

const SECTION_COLORS: Record<string,string> = {
  'acceptance criteria':'#059669','success metrics':'#059669','goals':'#059669',
  'edge cases':'#D97706','open questions':'#D97706','qa scenarios':'#D97706',
  'risks':'#DC2626','dependencies':'#DC2626',
  'user stories':'#2563EB','functional requirements':'#2563EB','functional reqs':'#2563EB',
  'overview':'#0891B2','problem statement':'#0891B2','solution':'#0891B2',
  'executive summary':'#7C3AED','timeline':'#7C3AED','key results':'#7C3AED',
}
function getSectionColor(title:string):string {
  const lower=title.toLowerCase()
  for(const[k,v]of Object.entries(SECTION_COLORS))if(lower.includes(k))return v
  return 'var(--accent)'
}

function CodeBlock({code,lang}:{code:string;lang:string}){
  const[copied,setCopied]=useState(false)
  return(
    <div className={styles.codeBlock}>
      <div className={styles.codeHeader}>
        <span className={styles.codeLang}>{lang||'code'}</span>
        <button className={styles.codeCopy} onClick={async()=>{await navigator.clipboard.writeText(code);setCopied(true);setTimeout(()=>setCopied(false),2000)}}>{copied?'✓':'Copy'}</button>
      </div>
      <pre className={styles.codePre}><code>{code}</code></pre>
    </div>
  )
}

function MarkdownBlock({text}:{text:string}){
  return(
    <div className={styles.mdBlock}>
      {text.trim().split('\n').map((line,i)=>{
        const t=line.trim()
        if(!t)return<div key={i} style={{height:8}}/>
        if(t.startsWith('## ')||t.startsWith('# ')){
          const title=t.replace(/^#+\s*/,'')
          const color=getSectionColor(title)
          return<div key={i} className={styles.mdSection} style={{borderLeftColor:color}}><span style={{color}}>{title}</span></div>
        }
        if(t.startsWith('### '))return<h4 key={i} className={styles.mdH4}>{t.replace(/^###\s*/,'')}</h4>
        if(t.match(/^\d+\.\s/))return<div key={i} className={styles.mdOl}><span className={styles.mdOlN}>{t.match(/^(\d+)/)?.[1]}.</span><span dangerouslySetInnerHTML={{__html:t.replace(/^\d+\.\s/,'').replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')}}/></div>
        if(t.startsWith('- ')||t.startsWith('• '))return<div key={i} className={styles.mdUl}><span className={styles.mdBullet}>—</span><span dangerouslySetInnerHTML={{__html:t.replace(/^[-•]\s/,'').replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')}}/></div>
        if(t.startsWith('|'))return<p key={i} className={styles.mdTable}>{t}</p>
        return<p key={i} className={styles.mdP} dangerouslySetInnerHTML={{__html:t.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')}}/>
      })}
    </div>
  )
}

function renderContent(text:string){
  if(!text)return null
  const blocks=text.split(/(```[\s\S]*?```)/g)
  return blocks.map((block,i)=>{
    if(block.startsWith('```')){
      const lines=block.slice(3).split('\n')
      const lang=lines[0].trim()
      const code=lines.slice(1,-1).join('\n')
      return<CodeBlock key={i} code={code} lang={lang}/>
    }
    return block.trim()?<MarkdownBlock key={i} text={block}/>:null
  })
}

function buildMemCtx(mem:Record<string,string>):string{
  const lines:string[]=[]
  MEMORY_SECTIONS.forEach(s=>s.questions.forEach(q=>{if(mem[q.id])lines.push(`${q.label}: ${mem[q.id]}`)}))
  return lines.join('\n')
}

export default function Home(){
  const{t,lang,setLang}=useI18n()
  const tFn=t

  const[activeTool,setActiveTool]=useState<ToolId>('spec')
  const[messages,setMessages]=useState<Message[]>([])
  const[input,setInput]=useState('')
  const[loading,setLoading]=useState(false)
  const[attachedFiles,setAttachedFiles]=useState<{name:string;content:string;type:string}[]>([])
  const[outputTabs,setOutputTabs]=useState<OutputTab[]>([])
  const[activeTabId,setActiveTabId]=useState<string|null>(null)
  const[memory,setMemory]=useState<Record<string,string>>({})
  const[memSaved,setMemSaved]=useState(false)
  const[sections,setSections]=useState<Set<string>>(new Set(SECTIONS.filter(s=>s.default).map(s=>s.id)))
  const[productType,setProductType]=useState('API platform')
  const[primaryUser,setPrimaryUser]=useState('')
  const[diffB,setDiffB]=useState('')
  const[diagType,setDiagType]=useState('flowchart')
  const[prompts,setPrompts]=useState<Prompt[]>([])
  const[newPromptTitle,setNewPromptTitle]=useState('')
  const[newPromptText,setNewPromptText]=useState('')
  const[promptSaved,setPromptSaved]=useState(false)
  const[history,setHistory]=useState<HistoryEntry[]>([])
  const chatEndRef=useRef<HTMLDivElement>(null)
  const fileInputRef=useRef<HTMLInputElement>(null)
  const mermaidRef=useRef<HTMLDivElement>(null)

  const language=lang==='en'?'English':lang==='ta'?'Tamil':lang==='es'?'Spanish':lang==='fr'?'French':lang==='de'?'German':'Japanese'

  useEffect(()=>{
    const h=localStorage.getItem('pm-v7-history');if(h)try{const p=JSON.parse(h);setHistory(p.map((e:HistoryEntry)=>({...e,createdAt:new Date(e.createdAt)})))}catch{}
    const m=localStorage.getItem('pm-v7-memory');if(m)try{setMemory(JSON.parse(m));setMemSaved(true)}catch{}
    const pr=localStorage.getItem('pm-v7-prompts');if(pr)try{setPrompts(JSON.parse(pr).map((e:Prompt)=>({...e,createdAt:new Date(e.createdAt)})))}catch{}
  },[])

  useEffect(()=>{chatEndRef.current?.scrollIntoView({behavior:'smooth'})},[messages])

  const saveMemory=()=>{localStorage.setItem('pm-v7-memory',JSON.stringify(memory));setMemSaved(true)}
  const memCtx=buildMemCtx(memory)

  const addOutputTab=useCallback((tool:ToolId,title:string,content:string,raw:string)=>{
    const tab:OutputTab={id:Date.now().toString(),tool,title,content,raw,createdAt:new Date()}
    setOutputTabs(prev=>[tab,...prev].slice(0,20))
    setActiveTabId(tab.id)
    const entry:HistoryEntry={id:tab.id,tool,title,content:raw,createdAt:tab.createdAt}
    setHistory(prev=>{const h=[entry,...prev].slice(0,50);localStorage.setItem('pm-v7-history',JSON.stringify(h));return h})
  },[])

  const closeTab=(id:string)=>{
    setOutputTabs(prev=>{const next=prev.filter(t=>t.id!==id);if(activeTabId===id)setActiveTabId(next[0]?.id||null);return next})
  }

  const handleFileAttach=useCallback(async(file:File)=>{
    const reader=new FileReader()
    reader.onload=async(e)=>{
      const content=e.target?.result as string
      setAttachedFiles(prev=>[...prev,{name:file.name,content,type:file.type}])
      // Try memory extraction
      try{
        const res=await fetch('/api/extract-memory',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({content:content.slice(0,8000),filename:file.name})})
        if(res.ok){const data=await res.json();if(data.memory){setMemory(prev=>({...prev,...data.memory}));setMessages(p=>[...p,{role:'assistant',content:`I've read **${file.name}** and extracted context. Check Memory tool to review.`}])}}
      }catch{}
    }
    reader.readAsText(file)
  },[])

  function formatRisk(r:{summary:string;overall_risk:string;risk_score:number;top_3_to_address:string[];risks:{category:string;title:string;description:string;severity:string;probability:string;mitigation:string;owner:string}[]}):string{
    return[`## Risk Summary\n${r.summary}\n\n**Overall risk:** ${r.overall_risk} · Score: ${r.risk_score}/100`,
      `\n## Top 3 to Address\n${r.top_3_to_address.map((x,i)=>`${i+1}. ${x}`).join('\n')}`,
      `\n## Risk Register\n${r.risks.map(x=>`**${x.title}** (${x.category} · ${x.severity} severity)\n${x.description}\n- Probability: ${x.probability} · Owner: ${x.owner}\n- Mitigation: ${x.mitigation}`).join('\n\n')}`
    ].join('\n')
  }

  function formatDiff(d:{summary:string;change_magnitude:string;net_assessment:string;improvements:string[];regressions:string[];changes:{type:string;section:string;description:string;impact:string;verdict:string}[]}):string{
    return[`## Diff Summary\n${d.summary}\n\n**Change magnitude:** ${d.change_magnitude}`,
      `\n## Assessment\n${d.net_assessment}`,
      d.improvements.length?`\n## Improvements\n${d.improvements.map(x=>`- ${x}`).join('\n')}`:null,
      d.regressions.length?`\n## Regressions\n${d.regressions.map(x=>`- ${x}`).join('\n')}`:null,
      `\n## Changes\n${d.changes.map(x=>`**${x.section}** (${x.type} · ${x.impact} · ${x.verdict})\n${x.description}`).join('\n\n')}`
    ].filter(Boolean).join('\n')
  }

  const buildPrompt=useCallback(():{endpoint:string;body:object;histTitle:string}|null=>{
    const fileContext=attachedFiles.length>0?'\n\nAttached:\n'+attachedFiles.map(f=>`[${f.name}]:\n${f.content.slice(0,3000)}`).join('\n\n'):''
    const mem=memCtx+fileContext
    switch(activeTool){
      case'spec':return{endpoint:'generate',body:{feature:input,productType,primaryUser,sections:SECTIONS.filter(s=>sections.has(s.id)).map(s=>s.label),language,memoryContext:mem},histTitle:input}
      case'prd':return{endpoint:'prd',body:{oneliner:input,language,memoryContext:mem},histTitle:input}
      case'meeting':return{endpoint:'meeting',body:{notes:input,language},histTitle:input.slice(0,60)}
      case'okr':return{endpoint:'okr',body:{focus:input,language,memoryContext:mem},histTitle:input.slice(0,60)}
      case'competitive':return{endpoint:'competitive',body:{product:input,competitors:'',language},histTitle:input}
      case'interview':return{endpoint:'interview',body:{role:input,language,memoryContext:mem},histTitle:input||'PM interview'}
      case'changelog':return{endpoint:'changelog',body:{input,language},histTitle:'Changelog'}
      case'pricing':return{endpoint:'pricing',body:{product:input,tiers:'',language},histTitle:input}
      case'risk':return{endpoint:'risk',body:{spec:input,language},histTitle:input.slice(0,60)}
      case'diff':return{endpoint:'diff',body:{specA:input,specB:diffB,language},histTitle:'Spec diff'}
      case'diagram':return{endpoint:'diagram',body:{description:input,diagramType:diagType,language},histTitle:input}
      case'csv':return{endpoint:'analyse',body:{csvContent:input,question:'',language,memoryContext:mem},histTitle:'CSV analysis'}
      default:return null
    }
  },[activeTool,input,productType,primaryUser,sections,language,memCtx,attachedFiles,diffB,diagType])

  const send=useCallback(async()=>{
    if(!input.trim()||loading)return
    const userMsg=input.trim()
    setInput('')
    setMessages(p=>[...p,{role:'user',content:userMsg+(attachedFiles.length>0?`\n\n📎 ${attachedFiles.map(f=>f.name).join(', ')}`:'') }])
    setLoading(true)
    const config=buildPrompt()
    if(!config){setLoading(false);return}
    try{
      const res=await fetch(`/api/${config.endpoint}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(config.body)})
      const data=await res.json()
      if(data.error)throw new Error(data.error)
      const raw=data.spec||data.result||(typeof data.result==='object'?JSON.stringify(data.result,null,2):'')||data.mermaid||''
      let display=raw
      if(activeTool==='risk'&&data.result&&typeof data.result==='object')display=formatRisk(data.result)
      if(activeTool==='diff'&&data.result&&typeof data.result==='object')display=formatDiff(data.result)
      if(activeTool==='diagram'){
        display='```mermaid\n'+raw+'\n```'
        setTimeout(async()=>{if(mermaidRef.current){try{const{loadMermaid}=await import('./lib/mermaid');const m=await loadMermaid();if(m){const{svg}=await m.render('d-'+Date.now(),raw);mermaidRef.current.innerHTML=svg}}catch{}}},400)
      }
      setMessages(p=>[...p,{role:'assistant',content:display}])
      addOutputTab(activeTool,config.histTitle||userMsg.slice(0,50),display,raw)
      setAttachedFiles([])
    }catch(e:unknown){setMessages(p=>[...p,{role:'assistant',content:'❌ '+(e instanceof Error?e.message:'Something went wrong.')}])}
    setLoading(false)
  },[input,loading,buildPrompt,activeTool,addOutputTab,attachedFiles])

  const PLACEHOLDERS:Record<ToolId,string>={
    memory:'Describe your role, product, or paste your resume to extract context...',
    spec:'Describe a feature, e.g. "Add rate limiting dashboard so API customers can see real-time usage..."',
    prd:'One-liner, e.g. "Self-service API key management so devs can create/rotate/revoke keys without support"',
    meeting:'Paste your meeting notes here — as messy as they are...',
    okr:'Focus areas, e.g. "Improve API reliability, grow developer adoption, reduce support tickets"',
    competitive:'Your product + competitors, e.g. "Buildings API vs Google Maps API, Geocodio, HERE API"',
    interview:'Role you\'re interviewing for, e.g. "Platform PM at a fintech with API focus"',
    changelog:'Paste changes, git diff, or bullet list of what shipped...',
    pricing:'Product + tiers, e.g. "Buildings API — Free: 1K calls, Pro $49: 50K calls, Enterprise: custom"',
    risk:'Paste your spec or feature description to analyse for risks...',
    diff:'Paste Spec A (original) here. Add Spec B in the field below.',
    diagram:'Describe your flow, e.g. "User onboarding: sign up → email verify → profile setup → first API call"',
    csv:'Paste CSV data or a question about your data...',
    prompts:'Enter a prompt to save to your library...',
    history:'Your output history',
  }

  const activeTab=outputTabs.find(t=>t.id===activeTabId)

  const downloadMd=(tab:OutputTab)=>{const b=new Blob([tab.raw],{type:'text/markdown'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download=`${tab.title.slice(0,40).replace(/\s+/g,'-').toLowerCase()}.md`;a.click();URL.revokeObjectURL(u)}

  const savePrompt=()=>{
    if(!newPromptTitle.trim()||!newPromptText.trim())return
    const p:Prompt={id:Date.now().toString(),tool:activeTool,title:newPromptTitle,prompt:newPromptText,createdAt:new Date()}
    const updated=[p,...prompts].slice(0,100);setPrompts(updated);localStorage.setItem('pm-v7-prompts',JSON.stringify(updated))
    setNewPromptTitle('');setNewPromptText('');setPromptSaved(true);setTimeout(()=>setPromptSaved(false),2000)
  }

  return(
    <div className={styles.app}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.logo}><span className={styles.lm}>PM/</span><span className={styles.lt}>toolkit</span></span>
          <span className={styles.tagline}>{tFn('sidebar.tagline')}</span>
        </div>
        <div className={styles.langRow}>
          {SUPPORTED_LANGUAGES.map(l=>(
            <button key={l.code} className={`${styles.langPill} ${lang===l.code?styles.langPillActive:''}`} onClick={()=>setLang(l.code)} title={l.label}>
              {l.code.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      {/* Tool bar */}
      <div className={styles.toolBar}>
        {TOOLS.map(tool=>(
          <button key={tool.id} className={`${styles.toolPill} ${activeTool===tool.id?styles.toolPillActive:''}`}
            onClick={()=>{setActiveTool(tool.id);setMessages([]);setInput('')}}>
            <span>{tool.icon}</span><span>{tool.label}</span>
          </button>
        ))}
      </div>

      {/* Workspace */}
      <div className={styles.workspace}>
        {/* Conversation panel */}
        <div className={styles.convPanel}>
          {/* Tool context */}
          <div className={styles.toolCtx}>
            <span className={styles.toolCtxName}>{TOOLS.find(t=>t.id===activeTool)?.icon} {TOOLS.find(t=>t.id===activeTool)?.label}</span>
            {activeTool==='spec'&&(
              <div className={styles.ctxOptions}>
                <select value={productType} onChange={e=>setProductType(e.target.value)} className={styles.ctxSelect}>
                  {['API platform','SaaS dashboard','Mobile app','Developer tool','Internal tool','E-commerce'].map(t=><option key={t}>{t}</option>)}
                </select>
                <input className={styles.ctxInput} placeholder="Primary user" value={primaryUser} onChange={e=>setPrimaryUser(e.target.value)}/>
              </div>
            )}
            {activeTool==='diagram'&&(
              <select value={diagType} onChange={e=>setDiagType(e.target.value)} className={styles.ctxSelect}>
                {['flowchart','sequenceDiagram','userJourney','stateDiagram','erDiagram','mindmap'].map(t=><option key={t}>{t}</option>)}
              </select>
            )}
          </div>

          {/* Spec section pills */}
          {activeTool==='spec'&&(
            <div className={styles.sectionPills}>
              {SECTIONS.map(s=>(
                <button key={s.id} className={`${styles.sectionPill} ${sections.has(s.id)?styles.sectionPillActive:''}`}
                  onClick={()=>setSections(prev=>{const n=new Set(prev);n.has(s.id)?n.delete(s.id):n.add(s.id);return n})}>
                  {s.label}
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          <div className={styles.messages}>
            {messages.length===0&&(
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>{TOOLS.find(t=>t.id===activeTool)?.icon}</div>
                <p className={styles.emptyTitle}>{TOOLS.find(t=>t.id===activeTool)?.label}</p>
                <p className={styles.emptyHint}>{PLACEHOLDERS[activeTool]}</p>
                {activeTool==='memory'&&memSaved&&<p className={styles.memChip}>✓ Memory saved — {Object.values(memory).filter(Boolean).length} fields filled</p>}
              </div>
            )}
            {messages.map((msg,i)=>(
              <div key={i} className={`${styles.msg} ${msg.role==='user'?styles.msgUser:styles.msgAssistant}`}>
                {msg.role==='assistant'?<div className={styles.msgContent}>{renderContent(msg.content)}</div>:<div className={styles.msgUserContent}>{msg.content}</div>}
              </div>
            ))}
            {loading&&<div className={`${styles.msg} ${styles.msgAssistant}`}><div className={styles.typing}><span/><span/><span/></div></div>}
            <div ref={chatEndRef}/>
          </div>

          {/* Memory form */}
          {activeTool==='memory'&&(
            <div className={styles.memoryForm}>
              {MEMORY_SECTIONS.map(sec=>(
                <div key={sec.id} className={styles.memSecGroup}>
                  <div className={styles.memSecTitle}><span>{sec.icon}</span><span>{sec.title}</span></div>
                  <div className={styles.memSecGrid}>
                    {sec.questions.map(q=>(
                      <div key={q.id} className={`${styles.memField} ${q.type==='textarea'?styles.memFieldFull:''}`}>
                        <label className={styles.memLabel}>{q.label}</label>
                        {q.type==='textarea'
                          ?<textarea placeholder={q.placeholder} value={memory[q.id]||''} onChange={e=>setMemory(p=>({...p,[q.id]:e.target.value}))}/>
                          :<input type="text" placeholder={q.placeholder} value={memory[q.id]||''} onChange={e=>setMemory(p=>({...p,[q.id]:e.target.value}))}/>
                        }
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className={styles.memActions}>
                <button className={styles.saveMemBtn} onClick={saveMemory}>Save memory →</button>
                {memSaved&&<span className={styles.savedMsg}>✓ Saved</span>}
              </div>
            </div>
          )}

          {/* Diff second input */}
          {activeTool==='diff'&&(
            <div className={styles.diffBWrap}>
              <label className={styles.memLabel}>Spec B — revised</label>
              <textarea className={styles.diffBInput} placeholder="Paste the revised spec version..." value={diffB} onChange={e=>setDiffB(e.target.value)}/>
            </div>
          )}

          {/* Prompts panel */}
          {activeTool==='prompts'&&(
            <div className={styles.promptsPanel}>
              <div className={styles.promptsForm}>
                <input type="text" placeholder="Prompt name" value={newPromptTitle} onChange={e=>setNewPromptTitle(e.target.value)}/>
                <textarea placeholder="Prompt text..." value={newPromptText} onChange={e=>setNewPromptText(e.target.value)}/>
                <button className={styles.saveMemBtn} onClick={savePrompt}>{promptSaved?'Saved! ✓':'Save prompt →'}</button>
              </div>
              <div className={styles.promptsList}>
                {prompts.map(p=>(
                  <div key={p.id} className={styles.promptItem}>
                    <div><div className={styles.promptTool}>{p.tool}</div><div className={styles.promptTitle}>{p.title}</div></div>
                    <div style={{display:'flex',gap:6}}>
                      <button className={styles.smallBtn} onClick={()=>{setInput(p.prompt);setActiveTool(p.tool)}}>Apply →</button>
                      <button className={styles.smallBtn} onClick={()=>{const u=prompts.filter(x=>x.id!==p.id);setPrompts(u);localStorage.setItem('pm-v7-prompts',JSON.stringify(u))}}>×</button>
                    </div>
                  </div>
                ))}
                {prompts.length===0&&<p className={styles.emptyHint}>No prompts saved yet.</p>}
              </div>
            </div>
          )}

          {/* History panel */}
          {activeTool==='history'&&(
            <div className={styles.historyPanel}>
              {history.map(e=>(
                <div key={e.id} className={styles.histItem}>
                  <div><div className={styles.histTool}>{e.tool}</div><div className={styles.histTitle}>{e.title}</div></div>
                  <button className={styles.smallBtn} onClick={()=>addOutputTab(e.tool,e.title,e.content,e.content)}>View →</button>
                </div>
              ))}
              {history.length===0&&<p className={styles.emptyHint}>No history yet.</p>}
            </div>
          )}

          {/* Input area */}
          {activeTool!=='memory'&&activeTool!=='prompts'&&activeTool!=='history'&&(
            <div className={styles.inputArea}>
              {attachedFiles.length>0&&(
                <div className={styles.attachedFiles}>
                  {attachedFiles.map((f,i)=>(
                    <span key={i} className={styles.attachedFile}>📎 {f.name}<button onClick={()=>setAttachedFiles(prev=>prev.filter((_,j)=>j!==i))}>×</button></span>
                  ))}
                </div>
              )}
              <div className={styles.inputRow}>
                <button className={styles.attachBtn} onClick={()=>fileInputRef.current?.click()} title="Attach file">📎</button>
                <input ref={fileInputRef} type="file" style={{display:'none'}} accept=".pdf,.txt,.md,.csv" onChange={e=>{const f=e.target.files?.[0];if(f)handleFileAttach(f);e.target.value=''}}/>
                <textarea className={styles.chatInput} placeholder={PLACEHOLDERS[activeTool]} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&(e.metaKey||e.ctrlKey))send()}} rows={3}/>
                <button className={styles.sendBtn} onClick={send} disabled={!input.trim()||loading}>{loading?'…':'→'}</button>
              </div>
              <div className={styles.inputHint}>⌘ + Enter to send</div>
            </div>
          )}
        </div>

        {/* Output panel */}
        <div className={styles.outputPanel}>
          <div className={styles.outputTabs}>
            {outputTabs.length===0&&<span className={styles.outputEmpty}>Outputs appear here</span>}
            {outputTabs.map(tab=>(
              <button key={tab.id} className={`${styles.outputTab} ${activeTabId===tab.id?styles.outputTabActive:''}`} onClick={()=>setActiveTabId(tab.id)}>
                <span>{TOOLS.find(t=>t.id===tab.tool)?.icon}</span>
                <span className={styles.outputTabTitle}>{tab.title.slice(0,18)}</span>
                <span className={styles.outputTabClose} onClick={e=>{e.stopPropagation();closeTab(tab.id)}}>×</span>
              </button>
            ))}
          </div>
          {activeTab?(
            <div className={styles.outputContent}>
              <div className={styles.outputActions}>
                <span className={styles.outputToolLabel}>{TOOLS.find(t=>t.id===activeTab.tool)?.icon} {activeTab.title.slice(0,40)}</span>
                <div style={{display:'flex',gap:6}}>
                  <button className={styles.smallBtn} onClick={async()=>navigator.clipboard.writeText(activeTab.raw)}>Copy</button>
                  <button className={styles.smallBtn} onClick={()=>downloadMd(activeTab)}>↓ .md</button>
                </div>
              </div>
              {activeTab.tool==='diagram'&&<div ref={mermaidRef} className={styles.mermaidOut}/>}
              <div className={styles.outputBody}>{renderContent(activeTab.content)}</div>
              {activeTab.tool==='spec'&&<SpecAnalyser rawSpec={activeTab.raw} language={language}/>}
            </div>
          ):(
            <div className={styles.outputPlaceholder}>
              <div className={styles.outputPlaceholderIcon}>✦</div>
              <p>Outputs appear as tabs.</p>
              <p className={styles.outputPlaceholderSub}>Each generation creates a new tab.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
