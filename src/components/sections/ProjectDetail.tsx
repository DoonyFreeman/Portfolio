import { motion } from 'framer-motion'
import { useEffect } from 'react'
import type { Project } from '../../data/projects'
import MagneticButton from '../MagneticButton'

/**
 * Полноэкранная деталь проекта. Контейнер делит layoutId с карточкой —
 * Framer Motion морфит карточку в этот оверлей и обратно при закрытии.
 */
export default function ProjectDetail({
  project,
  onClose,
}: {
  project: Project
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.documentElement.classList.add('lenis-stopped')
    return () => {
      window.removeEventListener('keydown', onKey)
      document.documentElement.classList.remove('lenis-stopped')
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto p-4 md:p-8">
      {/* Затемнение + глитч-вспышка */}
      <motion.div
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.article
        layoutId={`card-${project.id}`}
        className="relative z-10 my-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-[var(--color-void-2)]"
        style={{ boxShadow: `0 0 80px -20px ${project.accent}` }}
        transition={{ type: 'spring', stiffness: 220, damping: 30 }}
      >
        {/* Шапка с акцентом */}
        <div
          className="relative h-2 w-full"
          style={{ background: project.accent }}
        />
        <motion.div
          className="p-7 md:p-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.18 } }}
          exit={{ opacity: 0, y: 10 }}
        >
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <motion.h3
                layoutId={`title-${project.id}`}
                className="font-display text-3xl font-bold md:text-5xl"
              >
                {project.title}
              </motion.h3>
              <p className="mt-2 font-mono text-sm text-[var(--color-ink-dim)]">
                {project.subtitle} · {project.year}
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Закрыть"
              className="shrink-0 rounded-full border border-white/15 px-4 py-2 font-mono text-xs uppercase tracking-widest text-[var(--color-ink-dim)] transition-colors hover:border-white/40 hover:text-white"
            >
              esc ✕
            </button>
          </div>

          <p className="text-[var(--color-ink)] leading-relaxed">
            {project.summary}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {project.stack.map((s) => (
              <span
                key={s}
                className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-[var(--color-ink-dim)]"
              >
                {s}
              </span>
            ))}
          </div>

          <h4 className="mt-8 mb-3 font-mono text-xs uppercase tracking-widest text-[var(--color-neon-cyan)]">
            // ключевое
          </h4>
          <ul className="space-y-2">
            {project.highlights.map((h, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  transition: { delay: 0.24 + i * 0.05 },
                }}
                className="flex gap-3 text-sm text-[var(--color-ink-dim)]"
              >
                <span style={{ color: project.accent }}>▸</span>
                <span>{h}</span>
              </motion.li>
            ))}
          </ul>

          <div className="mt-9">
            <MagneticButton
              href={project.url}
              className="text-black"
              // акцентный фон через инлайн
            >
              <span
                className="absolute inset-0 -z-0 rounded-full"
                style={{ background: project.accent }}
              />
              <span className="relative z-10">Открыть на GitHub ↗</span>
            </MagneticButton>
          </div>
        </motion.div>
      </motion.article>
    </div>
  )
}
