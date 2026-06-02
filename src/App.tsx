import { useState } from 'react'
import type Lenis from 'lenis'
import { useReducedMotion } from './hooks/useReducedMotion'
import { useLenis } from './hooks/useLenis'
import Background from './components/Background'
import Cursor from './components/Cursor'
import Hero from './components/sections/Hero'
import About from './components/sections/About'
import TechStack from './components/sections/TechStack'
import Projects from './components/sections/Projects'
import Contact from './components/sections/Contact'

const NAV = [
  { id: 'about', label: 'обо мне' },
  { id: 'stack', label: 'стек' },
  { id: 'projects', label: 'проекты' },
  { id: 'contact', label: 'контакт' },
]

export default function App() {
  const reduced = useReducedMotion()
  const [lenis, setLenis] = useState<Lenis | null>(null)
  useLenis(!reduced, setLenis)

  const go = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    if (lenis) lenis.scrollTo(el, { offset: 0 })
    else el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="scanlines vignette relative">
      <Background reduced={reduced} />
      <Cursor />

      {/* Навигация */}
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-5 mix-blend-difference md:px-12">
        <button
          onClick={() => go('hero')}
          className="font-display text-lg font-bold tracking-tight text-white"
        >
          А.Р<span className="text-[var(--color-neon-magenta)]">_</span>
        </button>
        <nav className="hidden gap-7 font-mono text-xs uppercase tracking-widest md:flex">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => go(n.id)}
              className="text-white/70 transition-colors hover:text-white"
            >
              {n.label}
            </button>
          ))}
        </nav>
        <a
          href="https://github.com/DoonyFreeman"
          target="_blank"
          rel="noreferrer"
          className="font-mono text-xs uppercase tracking-widest text-white"
        >
          github ↗
        </a>
      </header>

      <main className="relative">
        <Hero reduced={reduced} />
        <About reduced={reduced} />
        <TechStack reduced={reduced} />
        <Projects reduced={reduced} />
        <Contact reduced={reduced} />
      </main>
    </div>
  )
}
