import { useEffect, useState } from 'react'
import { ProjectGrid, ProjectModal } from './components/Showcase'
import { caseStudies, type CaseStudy } from './data/caseStudies'

function projectFromHash() { return caseStudies.find(project => window.location.hash === `#project/${project.id}`) ?? null }

export default function App() {
  const [motion, setMotion] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [selected, setSelected] = useState<CaseStudy | null>(projectFromHash)
  const [service, setService] = useState('Сайт для бизнеса')
  useEffect(() => {
    const onHashChange = () => setSelected(projectFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])
  useEffect(() => { document.documentElement.style.scrollBehavior = motion ? '' : 'auto'; return () => { document.documentElement.style.scrollBehavior = '' } }, [motion])
  const openProject = (project: CaseStudy) => { window.location.hash = `project/${project.id}`; setSelected(project) }
  const closeProject = () => { window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#projects`); setSelected(null) }
  const message = encodeURIComponent(`Привет, Артём! Посмотрел портфолио. Интересует: ${service.toLowerCase()}. Моя задача: `)
  return <div className={motion ? 'portfolio' : 'portfolio motion-off'}>
    <a className="skip-link" href="#projects">Перейти к проектам</a>
    <header className="site-header wrap"><a className="wordmark" href="#home">артём<span>↗</span></a><nav aria-label="Основная навигация"><a href="#projects">Проекты</a><a href="#approach">Подход</a><a href="#contact">Контакт</a></nav><a className="header-cta" href="#contact">Обсудить задачу <span>↗</span></a></header>
    <main>
      <section id="home" className="hero wrap">
        <div className="hero-top"><span className="eyebrow"><i /> Артём Ребриков · разработчик</span><button className="motion-toggle" onClick={() => setMotion(!motion)} aria-pressed={motion}>Анимация {motion ? 'вкл' : 'выкл'}</button></div>
        <div className="hero-layout"><div><h1>Сложное внутри.<br/><span>Просто снаружи.</span></h1><p className="hero-description">Разрабатываю сайты, сервисы и инструменты,<br className="desktop-break"/> которые превращают вашу идею в работающий продукт.</p><div className="hero-actions"><a className="button dark" href="#projects">Посмотреть работы <span>↘</span></a><a className="text-link" href="#contact">Есть идея? Давайте обсудим ↗</a></div></div><div className="hero-object" aria-hidden="true"><div className="orbital orbital-one"/><div className="orbital orbital-two"/><div className="system-stack"><div className="system-layer layer-front"><span>01 / experience</span><strong>Понятный<br/>интерфейс<span className="layer-dot">↗</span></strong><div className="layer-lines"><i/><i/><i/></div></div><div className="system-layer layer-middle"><span>02 / logic</span><strong>Продуманная<br/>логика</strong></div><div className="system-layer layer-back"><span>03 / foundation</span><strong>Надёжная<br/>основа</strong></div></div><span className="object-caption">От первого экрана до последнего запроса</span></div></div>
        <div className="hero-bottom"><span>Python / FastAPI / React / Bitrix</span><a href="#projects">Листайте, здесь есть что посмотреть ↓</a></div>
      </section>
      <ProjectGrid onOpen={openProject} motion={motion}/>
      <section id="approach" className="wrap approach-section"><div className="section-heading"><div><span className="eyebrow">02 — Чем могу помочь</span><h2>Хорошо снаружи.<br/>Продумано внутри.</h2></div><p>Собираю интерфейс и техническую часть<br/>в один понятный для пользователя продукт.</p></div><div className="services-grid"><article><span className="service-icon">↗</span><h3>Сайты для бизнеса</h3><p>Корпоративные сайты, каталоги и сервисы, в которых посетителю легко найти нужное и оставить заявку.</p><span className="service-stack">React · Next.js · Bitrix · WordPress</span></article><article><span className="service-icon">⤳</span><h3>Backend и интеграции</h3><p>API, базы данных, авторизация, фоновые задачи и связь между вашими системами.</p><span className="service-stack">Python · FastAPI · PostgreSQL · Redis</span></article><article><span className="service-icon">✳</span><h3>Продуктовые инструменты</h3><p>Веб-приложения, автоматизация и AI-функции под конкретный рабочий сценарий.</p><span className="service-stack">TypeScript · LLM API · PyTorch · Docker</span></article></div><div className="about-row"><div className="about-person"><img src={`${import.meta.env.BASE_URL}me.jpg`} alt="Артём Ребриков" loading="lazy"/><div><strong>Артём Ребриков</strong><span>Разработчик · Москва</span></div></div><p>Мне интересны задачи целиком: как человек пользуется продуктом, как устроены данные и что происходит после нажатия кнопки. Поэтому в моих проектах интерфейс и backend работают вместе.</p></div><div className="process-row"><span className="eyebrow">От идеи до запуска</span><ol><li><span>01</span>Разбираемся в задаче</li><li><span>02</span>Собираем решение</li><li><span>03</span>Проверяем и запускаем</li></ol></div></section>
      <section id="contact" className="contact-section"><div className="wrap contact-layout"><div><span className="eyebrow">03 — Давайте познакомимся</span><h2>Что вы хотите<br/>создать<span>?</span></h2><p className="contact-description">Расскажите, что нужно сделать и кому это поможет.<br/>Обсудим решение, объём работы и следующие шаги.</p></div><div className="contact-actions"><span className="eyebrow">Мне нужно</span><div className="service-options" role="group" aria-label="Тип вашей задачи">{['Сайт для бизнеса', 'Веб-приложение', 'API и интеграции', 'Обсудить идею'].map(option => <button key={option} aria-pressed={service === option} onClick={() => setService(option)}>{option}</button>)}</div><a className="button acid" href={`https://t.me/Doony_Freeman?text=${message}`} target="_blank" rel="noreferrer">Написать в Telegram ↗</a><a className="contact-email" href={`mailto:rebrikov2006@gmail.com?subject=${encodeURIComponent(service)}&body=${message}`}>rebrikov2006@gmail.com</a></div></div></section>
    </main><footer className="wrap site-footer"><span>© {new Date().getFullYear()} Артём Ребриков</span><a href="#home">Наверх ↑</a></footer>
    {selected && <ProjectModal key={selected.id} project={selected} onClose={closeProject}/>}
  </div>
}
