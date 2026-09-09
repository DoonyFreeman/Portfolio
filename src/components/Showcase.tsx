import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { caseStudies, categories, type CaseStudy } from '../data/caseStudies'

import {DevicePreview} from './DevicePreview'
import {ProjectGallery} from './ProjectGallery'
import {BotDemo} from './BotDemo'

const asset = (file: string) => `${import.meta.env.BASE_URL}projects/${file}`

export function ProjectArtwork({ project }: { project: CaseStudy }) {
  if(project.cover) return <div className="project-art screenshot-art"><div className="screenshot-chrome"><span>● ● ●</span><span>{project.title} / preview</span><span>↗</span></div><img src={asset(project.cover)} alt={`${project.title} — скриншот работающего интерфейса`} loading="lazy"/><span className="screen-badge">Открыть проект ↗</span></div>
  if(project.demo==='bot') return <div className={`project-art bot-cover bot-${project.id}`}><span className="art-tag">{project.kind} / interactive scenario</span><h4>{project.title}</h4><div className="mini-chat"><span>{project.features[0]}</span><span>Попробуем? →</span><span>✓ {project.features[1]}</span></div><span className="art-open">↗</span></div>
  switch (project.id) {
    case 'masterstroy': return <div className="master-cover"><img src={asset('masterstroy.jpg')} alt="Жилой комплекс «Геометрия» — изображение из проекта Мастерстрой" loading="lazy"/><div className="cover-brand">мастерстрой<span>Сайт застройщика</span></div><span className="cover-label">Квартиры · Жилые комплексы · Ипотека</span><span className="art-open">↗</span></div>
    case 'upscaler': return <div className="project-art art-upscaler"><img src={asset('upscaler-after.jpg')} alt="Фотография озера после обработки в Upscaler" loading="lazy"/><span className="art-tag">Apple Silicon / on-device AI</span><span className="upscale-title">Маленький файл.<br/>Большая разница.</span><span className="upscale-multiplier">4×</span><span className="art-open">↗</span></div>
    case 'creder': return <div className="project-art art-creder" aria-label="Creder: шифрование между браузером и хранилищем"><span className="art-tag">Personal vault / WebCrypto</span><div className="vault-symbol">⌘</div><div className="vault-title">creder<span>your projects. your secrets.</span></div><div className="vault-footer"><span>Браузер</span><i>············</i><span>Шифротекст</span></div><span className="art-open">↗</span></div>
    case 'dollar-editor': return <div className="project-art art-editor"><span className="art-tag">Video tools / 9:16</span><div className="editor-title">make it<br/><i>talk.</i></div><img className="dollar-character" src={asset('dollar.png')} alt="Персонаж из Dollar Editor" loading="lazy"/><div className="editor-timeline" aria-hidden="true"><span>01 — Сценарий</span><span>02 — Голос</span><span>03 — Видео</span></div><span className="art-open">↗</span></div>
    case 'interview-prep': return <div className="project-art art-interview"><span className="art-tag">Learning / AI feedback</span><div className="interview-title">Сегодня — вопрос.<br/>Завтра — навык.</div><div className="learning-steps" aria-hidden="true"><span>Теория</span><i>↗</i><span>Практика</span><i>↗</i><span>Повторение</span></div><span className="art-open">↗</span></div>
    case 'wordle': return <div className="project-art art-wordle"><span className="art-tag">Browser game / Play here</span><div className="wordle-tiles" aria-hidden="true">{'WORDLE'.split('').map((letter, i) => <span key={i}>{letter}</span>)}</div><span className="wordle-caption">Небольшая пауза для большой идеи.</span><span className="art-open">↗</span></div>
    default: return <div className={`project-art art-system art-${project.id}`}><span className="art-tag">{project.kind}</span><span className="system-art-title">{project.id === 'booking' ? 'Запрос принят.' : project.id === 'messenger' ? 'На связи.' : 'Событие создано.'}</span><div className="architecture-mini" aria-hidden="true">{project.flow.map((step, i) => <div key={step.title}><span className="node-index">0{i + 1}</span><strong>{step.title}</strong>{i < 2 && <i>→</i>}</div>)}</div><span className="system-art-caption">{project.stack.slice(0, 3).join(' / ')}</span><span className="art-open">↗</span></div>
  }
}

function useTilt(enabled: boolean) {
  const frame = useRef(0)
  useEffect(() => () => cancelAnimationFrame(frame.current), [])
  const reset = (element: HTMLElement) => {
    cancelAnimationFrame(frame.current)
    element.style.removeProperty('--tilt-x'); element.style.removeProperty('--tilt-y'); element.style.removeProperty('--light-x'); element.style.removeProperty('--light-y')
  }
  return {
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      if (!enabled || event.pointerType !== 'mouse' || !matchMedia('(hover: hover) and (pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const element = event.currentTarget, bounds = element.getBoundingClientRect()
      const x = (event.clientX - bounds.left) / bounds.width - .5, y = (event.clientY - bounds.top) / bounds.height - .5
      cancelAnimationFrame(frame.current)
      frame.current = requestAnimationFrame(() => { element.style.setProperty('--tilt-x', `${-y * 8}deg`); element.style.setProperty('--tilt-y', `${x * 8}deg`); element.style.setProperty('--light-x',`${(x+.5)*100}%`); element.style.setProperty('--light-y',`${(y+.5)*100}%`) })
    },
    onPointerLeave: (event: PointerEvent<HTMLElement>) => reset(event.currentTarget),
  }
}

function ProjectCard({ project, index, onOpen, motion }: { project: CaseStudy; index: number; onOpen: (p: CaseStudy) => void; motion: boolean }) {
  const tilt = useTilt(motion)
  return <article className="project-card" {...tilt}>
    <button className="art-button" onClick={() => onOpen(project)} aria-label={`${project.title}: ${project.demo ? 'смотреть результат' : 'открыть кейс'}`}><ProjectArtwork project={project}/></button>
    <div className="project-summary"><div><div className="project-meta"><span className="eyebrow">{project.kind}</span><span className="project-number">{String(index + 1).padStart(2, '0')}</span></div><h3><button onClick={() => onOpen(project)}>{project.title} <span>↗</span></button></h3><p>{project.summary}</p><div className="stack-tags">{project.stack.map(tech => <span key={tech}>{tech}</span>)}</div></div><button className="project-try" onClick={() => onOpen(project)}>{project.demo ? project.demo==='bot'?'Попробовать сценарий':'Открыть проект' : 'Подробнее о проекте'} <span>↗</span></button></div>
  </article>
}

export function ProjectGrid({ onOpen, motion }: { onOpen: (p: CaseStudy) => void; motion: boolean }) {
  const [category, setCategory] = useState<string>('all')
  const filtered = caseStudies.filter(p => category === 'all' || p.category === category)
  return <section id="projects" className="works wrap"><div className="section-heading"><div><span className="eyebrow">01 — Избранные работы</span><h2>Идеи, которые<br/>стали проектами<span className="accent-period">.</span></h2></div><p>Сайты для бизнеса, продуктовые инструменты<br/>и то, что происходит под капотом.</p></div><div className="filter-bar"><div className="filters" role="group" aria-label="Фильтр проектов">{categories.map(c => <button key={c.id} onClick={() => setCategory(c.id)} aria-pressed={category === c.id}>{c.label}<span>{c.id === 'all' ? caseStudies.length : caseStudies.filter(p => p.category === c.id).length}</span></button>)}</div><span className="filter-count" aria-live="polite">{filtered.length} из {caseStudies.length} работ</span></div><div className="project-grid">{filtered.map(p => <ProjectCard key={p.id} project={p} index={caseStudies.indexOf(p)} onOpen={onOpen} motion={motion}/>)}</div></section>
}

function Architecture({ project }: { project: CaseStudy }) {
  const [active, setActive] = useState(0)
  return <div className="case-architecture"><span className="eyebrow">Как это работает</span><div className="flow-buttons" role="group" aria-label="Этапы работы проекта">{project.flow.map((step, i) => <button key={step.title} onClick={() => setActive(i)} aria-pressed={active === i}><span>0{i + 1}</span>{step.title}<i>{i < 2 ? '→' : '✓'}</i></button>)}</div><p aria-live="polite">{project.flow[active].text}</p></div>
}

function ImageComparison() {
  const [position, setPosition] = useState(50)
  return <div className="comparison-demo"><div className="comparison" style={{ '--split': `${position}%` } as CSSProperties}><img src={asset('upscaler-after.jpg')} alt="Фотография после увеличения в Upscaler"/><img className="comparison-before" src={asset('upscaler-before.jpg')} alt="Исходное изображение до увеличения"/><div className="comparison-labels" aria-hidden="true"><span>Исходник</span><span>После · 4×</span></div><div className="comparison-divider" aria-hidden="true"><span>↔</span></div></div><label className="comparison-control">Сравнить исходник и результат<input type="range" min="0" max="100" value={position} onChange={e => setPosition(Number(e.target.value))} aria-label="Доля исходного изображения" aria-valuetext={`${position}% исходного изображения`}/><span>{position}%</span></label><p className="demo-footnote">Настоящие изображения из проекта. Передвиньте ползунок или используйте стрелки на клавиатуре. Обработка новых фото выполняется в приложении для macOS.</p><details className="app-screenshot"><summary>Посмотреть интерфейс приложения <span>↓</span></summary><img src={asset('upscaler-app.png')} alt="Окно приложения Upscaler на macOS" loading="lazy"/></details></div>
}

const masterPages = [ ['index.html', 'Главная'], ['projects.html', 'Жилые комплексы'], ['apartments.html', 'Квартиры'], ['geometriya.html', 'Геометрия'], ['lesnoy.html', 'Лесной квартал'], ['mortgage.html', 'Ипотека'], ['about.html', 'О компании'] ]

function WebsitePreview({ project }: { project: CaseStudy }) {
  const [mobile, setMobile] = useState(false)
  const [page, setPage] = useState('index.html')
  const [reload, setReload] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [slow, setSlow] = useState(false)
  const snapshot = project.demo === 'masterstroy'
  const local = project.demo && ['interview','chai','autoimport','servicehub','docfind'].includes(project.demo)
  const src = snapshot ? `${import.meta.env.BASE_URL}demos/masterstroy/${page}` : local ? `${import.meta.env.BASE_URL}demos/${project.demo}/index.html` : project.website!
  useEffect(() => {
    setLoaded(false); setSlow(false)
    const timer = window.setTimeout(() => setSlow(true), 12000)
    return () => clearTimeout(timer)
  }, [src, reload])
  return <div className="website-preview">{project.demo==='docfind'&&<p className="demo-footnote">Попробуйте поиск: «поиск», «React», «проект». Пять демонстрационных документов; загрузка файлов отключена.</p>}{project.demo==='interview'&&<a className="full-app-link" href={project.website} target="_blank" rel="noreferrer">Полная версия: вход и регистрация ↗</a>}<div className="preview-note"><span className={`status-dot ${snapshot ? 'snapshot-dot' : ''}`}/><span>{snapshot ? 'Демонстрационная копия публичных страниц · 09.09.2026. Формы отключены, цены справочные.' : local ? 'Оригинальный интерфейс · локальные демоданные · без регистрации и отправки заявок.' : 'Работающая публичная игра · можно играть прямо здесь.'}</span></div>{snapshot && <div className="preview-pages" role="group" aria-label="Страницы Мастерстрой">{masterPages.map(([path, label]) => <button key={path} onClick={() => { setPage(path); setReload(n => n + 1) }}>{label}</button>)}</div>}<div className="browser-toolbar"><span className="browser-dots" aria-hidden="true">● ● ●</span><span className="browser-address">{snapshot ? 'Мастерстрой / демо' : `${project.title} / ${local ? 'демоверсия' : 'live'}`}</span><div className="viewport-controls" role="group" aria-label="Ширина предпросмотра"><button onClick={() => setMobile(false)} aria-pressed={!mobile} title="1280 пикселей · десктопный интерфейс">MacBook</button><button onClick={() => setMobile(true)} aria-pressed={mobile} title="393 пикселя · мобильный интерфейс">iPhone 17</button></div><button className="reload-button" onClick={() => setReload(n => n + 1)} aria-label="Перезагрузить демонстрацию">↻</button></div><DevicePreview mobile={mobile}><div className="device-content" aria-busy={!loaded}>{!loaded && <div className="iframe-loading" role="status">{slow ? 'Загрузка занимает больше времени. Попробуйте обновить демонстрацию.' : 'Открываю проект…'}</div>}<iframe key={`${src}-${reload}`} src={src} title={`${project.title} — ${snapshot ? 'демонстрационные страницы' : 'интерактивная версия'}`} sandbox={snapshot ? 'allow-scripts' : 'allow-scripts allow-same-origin'} referrerPolicy="no-referrer" onLoad={() => setLoaded(true)} onError={() => { setLoaded(true); setSlow(true) }}/></div></DevicePreview><p className="demo-footnote">{snapshot ? 'Копия показывает публичную вёрстку. Серверные функции, карты и отправка заявок здесь не подключены. Фото загружаются с сайта проекта.' : local ? project.demo==='interview' ? 'Данные не отправляются на сервер. ИИ-проверка заменена учебным разбором; прогресс действует в пределах сеанса.' : 'Изолированная демонстрация с локальными данными. Настоящие заявки и файлы не отправляются.' : 'Игра загружается с GitHub Pages. Если окно пустое, попробуйте перезагрузить демонстрацию.'}{slow && !loaded && ' Внешний сайт может быть временно недоступен.'}</p></div>
}

export function ProjectModal({ project, onClose }: { project: CaseStudy; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [view, setView] = useState<'case' | 'demo'>(project.demo ? 'demo' : 'case')
  useEffect(() => {
    const element = dialog.current!
    const previousFocus = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    element.showModal()
    return () => { element.close(); document.body.style.overflow = previousOverflow; previousFocus?.focus({ preventScroll: true }) }
  }, [])
  return <dialog ref={dialog} className="project-dialog" aria-labelledby="case-title" onCancel={event => { event.preventDefault(); onClose() }} onClick={event => { if (event.target === event.currentTarget) { const r = event.currentTarget.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) onClose() } }}><div className="dialog-header"><a className="dialog-brand" href="#projects" onClick={e => { e.preventDefault(); onClose() }}>← Все проекты</a><span>{project.kind}</span><button className="close-button" onClick={onClose} autoFocus aria-label="Закрыть проект">✕</button></div><div className="dialog-body"><div className="case-heading"><div><span className="eyebrow">{project.subtitle}</span><h2 id="case-title">{project.title}</h2></div><div className="case-tabs" role="group" aria-label="Содержимое кейса"><button aria-pressed={view === 'case'} onClick={() => setView('case')}>О проекте</button>{project.demo && <button aria-pressed={view === 'demo'} onClick={() => setView('demo')}>{project.demo === 'wordle' ? 'Играть' : 'Смотреть результат'} ↗</button>}</div></div><div className="case-tech-strip"><span>Стек проекта</span><div className="stack-tags">{project.stack.map(tech=><span key={tech}>{tech}</span>)}</div></div>{view === 'demo' ? project.demo === 'upscaler' ? <ImageComparison/> : project.demo==='bot' ? <BotDemo project={project}/> : project.demo==='gallery' ? <ProjectGallery project={project}/> : <WebsitePreview project={project}/> : <><div className="case-intro"><p>{project.summary}</p><div className="stack-tags">{project.stack.map(tech => <span key={tech}>{tech}</span>)}</div></div><div className="case-narrative"><section><span className="eyebrow">01 / Задача</span><p>{project.challenge}</p></section><section><span className="eyebrow">02 / Что я сделал</span><p>{project.solution}</p></section><section><span className="eyebrow">03 / Результат</span><p>{project.result}</p></section></div><div className="case-features">{project.features.map(feature => <div key={feature}><span>↗</span>{feature}</div>)}</div><Architecture project={project}/></>}<div className="case-bottom"><a className="button dark" href={`https://t.me/Doony_Freeman?text=${encodeURIComponent(`Привет, Артём! Посмотрел проект «${project.title}» в портфолио. Хочу обсудить свою задачу.`)}`} target="_blank" rel="noreferrer">Обсудить похожий проект ↗</a><div className="case-resources">{project.website && <a href={project.website} target="_blank" rel="noreferrer">Оригинальный сайт ↗</a>}{project.source && <a href={project.source} target="_blank" rel="noreferrer">Открытый исходный код ↗</a>}{!project.source && <span>Исходники не представлены</span>}</div></div></div></dialog>
}
