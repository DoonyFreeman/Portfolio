import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import GlitchText from '../GlitchText'
import Marquee from '../Marquee'
import MagneticButton from '../MagneticButton'

const TICKER = [
  'PYTHON',
  'FASTAPI',
  'POSTGRESQL',
  'SQLALCHEMY',
  'REDIS',
  'CELERY',
  'RABBITMQ',
  'KAFKA',
  'DOCKER',
  'ASYNC / AWAIT',
]

export default function Hero({ reduced }: { reduced: boolean }) {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (reduced || !rootRef.current) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
      tl.from('.hero-kicker', { y: 30, opacity: 0, duration: 0.8 })
        .from('.hero-line', { yPercent: 120, opacity: 0, duration: 1, stagger: 0.12 }, '-=0.4')
        .from('.hero-sub', { y: 24, opacity: 0, duration: 0.8 }, '-=0.5')
        .from('.hero-cta', { y: 20, opacity: 0, duration: 0.7, stagger: 0.1 }, '-=0.5')

      // Параллакс заголовка от движения мыши
      const onMove = (e: MouseEvent) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 24
        const y = (e.clientY / window.innerHeight - 0.5) * 18
        gsap.to('.hero-title', { x, y, duration: 0.6, ease: 'power2.out' })
      }
      window.addEventListener('mousemove', onMove)
      return () => window.removeEventListener('mousemove', onMove)
    }, rootRef)
    return () => ctx.revert()
  }, [reduced])

  return (
    <section
      ref={rootRef}
      id="hero"
      className="relative z-10 flex min-h-[100svh] flex-col justify-center px-6 pt-24 md:px-12"
    >
      <p className="hero-kicker mb-6 font-mono text-xs uppercase tracking-[0.4em] text-[var(--color-neon-cyan)] text-glow-cyan">
        // Backend Developer · Middle · Москва
      </p>

      <h1 className="hero-title font-display text-[15vw] font-extrabold leading-[0.92] tracking-tight md:text-[11vw] lg:text-[9.5rem]">
        <span className="block overflow-hidden pt-[0.18em] -mt-[0.16em]">
          <span className="hero-line block">АРТЁМ</span>
        </span>
        <span className="block overflow-hidden pt-[0.18em] -mt-[0.16em]">
          <GlitchText
            text="РЕБРИКОВ"
            className="hero-line block text-transparent"
          />
        </span>
      </h1>

      <style>{`
        #hero .glitch.hero-line {
          background: linear-gradient(92deg, var(--color-neon-magenta), var(--color-neon-violet), var(--color-neon-cyan));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
      `}</style>

      <p className="hero-sub mt-8 max-w-xl font-mono text-sm leading-relaxed text-[var(--color-ink-dim)] md:text-base">
        Проектирую async-бэкенды промышленного уровня на{' '}
        <span className="text-[var(--color-ink)]">FastAPI</span>: event-driven
        архитектура, кэширование, фоновые задачи и чистая изоляция слоёв.
      </p>

      <div className="hero-cta mt-10 flex flex-wrap items-center gap-4">
        <MagneticButton
          onClick={() =>
            document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })
          }
          className="bg-[var(--color-neon-magenta)] text-black neon-border hover:brightness-110"
        >
          Смотреть проекты ↓
        </MagneticButton>
        <MagneticButton
          href="https://github.com/DoonyFreeman"
          className="border border-[var(--color-neon-violet)]/50 text-[var(--color-ink)] hover:bg-white/5"
        >
          GitHub ↗
        </MagneticButton>
      </div>

      <div className="absolute inset-x-0 bottom-0 border-y border-white/10 bg-black/30 py-3 font-mono text-2xl font-bold uppercase tracking-tight text-white/15 backdrop-blur-sm">
        <Marquee items={TICKER} duration={reduced ? 999999 : 26} />
      </div>
    </section>
  )
}
