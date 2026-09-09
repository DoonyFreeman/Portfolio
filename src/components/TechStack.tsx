import {caseStudies} from '../data/caseStudies'
import {useState} from 'react'
const groups=[
 {title:'Python / Backend',lead:'Основная специализация',items:['Python','FastAPI','SQLAlchemy','SQLModel','Pydantic','PostgreSQL','Redis','Celery','TaskIQ']},
 {title:'Frontend',lead:'От интерфейса до интерактива',items:['JavaScript','TypeScript','React','Next.js','HTML','CSS','Konva.js','Zustand']},
 {title:'Инфраструктура',lead:'Запуск, данные и интеграции',items:['Docker','Git','GitHub Pages','MinIO','Elasticsearch','Kafka','Socket.IO','GraphQL']},
 {title:'Другие направления',lead:'Под задачу проекта',items:['Java','PHP','1С-Битрикс','WordPress','aiogram','PyTorch','PySide6','WebCrypto']},
]
export function TechStack(){const[selected,setSelected]=useState<string|null>(null)
 const matches=selected?caseStudies.filter(p=>p.stack.some(s=>s.toLowerCase()===selected.toLowerCase())):[]
 return <section className="tech-section wrap" id="stack"><div className="section-heading"><div><span className="eyebrow">Мой стек</span><h2>Python в основе.<br/>Возможности шире.</h2></div><p>Мой основной фокус — backend на Python.<br/>Также работаю с Java и frontend.</p></div><div className="tech-grid">{groups.map((g,i)=><article key={g.title} className={i===0?'tech-primary':''}><span className="tech-index">0{i+1} / {g.lead}</span><h3>{g.title}</h3><div className="tech-pills">{g.items.map(t=><button key={t} aria-pressed={selected===t} onClick={()=>setSelected(selected===t?null:t)}>{t}</button>)}</div></article>)}</div><div className="tech-evidence" aria-live="polite">{selected?<><strong>{selected}</strong>{matches.length?<span>В проектах: {matches.map((p,i)=><span key={p.id}>{i>0?' · ':''}<a href={`#project/${p.id}`}>{p.title} ↗</a></span>)}</span>:<span>В моём стеке; отдельный кейс пока не представлен.</span>}<button onClick={()=>setSelected(null)} aria-label="Сбросить выбор технологии">✕</button></>:<span>Выберите технологию — посмотрите проекты, в которых я её использовал.</span>}</div></section>
}
