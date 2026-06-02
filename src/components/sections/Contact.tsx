import GlitchText from '../GlitchText'
import MagneticButton from '../MagneticButton'
import { useReveal } from '../../hooks/useReveal'

export default function Contact({ reduced }: { reduced: boolean }) {
  const ref = useReveal<HTMLElement>(!reduced)

  return (
    <section
      ref={ref}
      id="contact"
      className="relative z-10 px-6 py-32 text-center md:px-12 md:py-44"
    >
      <p className="reveal mb-6 font-mono text-xs uppercase tracking-[0.4em] text-[var(--color-neon-cyan)]">
        // на связь
      </p>
      <h2 className="reveal font-display text-5xl font-bold leading-none md:text-8xl">
        <GlitchText text="ДАВАЙ" /> <br />
        <span className="text-[var(--color-neon-magenta)] text-glow-magenta">
          СОБЕРЁМ
        </span>{' '}
        БЭКЕНД
      </h2>
      <p className="reveal mx-auto mt-8 max-w-md text-[var(--color-ink-dim)]">
        Открыт к Middle Backend-позициям, стажировкам и пет-проектам. Пиши.
      </p>

      <div className="reveal mt-10 flex flex-wrap items-center justify-center gap-4">
        <MagneticButton
          href="mailto:rebrikov2006@gmail.com"
          className="bg-[var(--color-neon-cyan)] text-black neon-border hover:brightness-110"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m2 7 10 6 10-6" />
          </svg>
          Написать на почту
        </MagneticButton>
        <MagneticButton
          href="https://github.com/DoonyFreeman"
          className="border border-white/20 text-[var(--color-ink)] hover:bg-white/5"
        >
          GitHub ↗
        </MagneticButton>
      </div>

      <footer className="reveal mt-24 flex flex-col items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-[var(--color-ink-dim)]">
        <div>Артём Ребриков · Москва · {new Date().getFullYear()}</div>
        <div className="text-white/20">
          собрано на react · gsap · framer motion
        </div>
      </footer>
    </section>
  )
}
