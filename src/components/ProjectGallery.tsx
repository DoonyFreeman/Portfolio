import {useState} from 'react'
import type {CaseStudy} from '../data/caseStudies'
export function ProjectGallery({project}:{project:CaseStudy}){
 const [selected,setSelected]=useState(0)
 const pictures=project.gallery||[]
 return <section className="project-gallery"><p className="demo-footnote">Скриншоты настоящего приложения. Это галерея интерфейса, не подключённый редактор.</p><div className="gallery-tabs" role="group" aria-label="Экраны приложения">{pictures.map((p,i)=><button key={p.file} aria-pressed={selected===i} onClick={()=>setSelected(i)}>{p.label}</button>)}</div><figure><img src={`${import.meta.env.BASE_URL}projects/${pictures[selected].file}`} alt={pictures[selected].label}/><figcaption>{pictures[selected].label} · {selected+1} / {pictures.length}</figcaption></figure></section>
}
