import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { projects, type Project } from '../../data/projects'
import { useReveal } from '../../hooks/useReveal'
import TiltCard from '../TiltCard'
import ProjectDetail from './ProjectDetail'

export default function Projects({ reduced }: { reduced: boolean }) {
  const ref = useReveal<HTMLElement>(!reduced)
  const [active, setActive] = useState<Project | null>(null)

  return (
    <section ref={ref} id="projects" className="relative z-10 px-6 py-24 md:px-12">
      <div className="mx-auto max-w-6xl">
        <p className="reveal mb-4 font-mono text-xs uppercase tracking-[0.4em] text-[var(--color-neon-magenta)]">
          // selected work
        </p>
        <h2 className="reveal mb-3 font-display text-4xl font-bold md:text-6xl">
          Проекты
        </h2>
        <p className="reveal mb-12 max-w-lg text-[var(--color-ink-dim)]">
          Кликни по карточке — раскроется в полноэкранный разбор.
        </p>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <motion.div
              key={p.id}
              layoutId={`card-${p.id}`}
              onClick={() => setActive(p)}
              className={`reveal group cursor-pointer ${
                p.featured ? 'lg:col-span-1' : ''
              }`}
              transition={{ type: 'spring', stiffness: 220, damping: 30 }}
            >
              <TiltCard className="h-full">
                <div
                  className="relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm transition-colors duration-300 group-hover:border-white/25"
                  style={{ minHeight: 230 }}
                >
                  {/* Акцентная полоса */}
                  <div
                    className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                    style={{ background: p.accent }}
                  />
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-ink-dim)]">
                      {p.featured ? '★ featured' : p.category}
                    </span>
                    <span className="font-mono text-[10px] text-[var(--color-ink-dim)]">
                      {p.year}
                    </span>
                  </div>

                  <motion.h3
                    layoutId={`title-${p.id}`}
                    className="mt-6 font-display text-2xl font-bold leading-tight"
                  >
                    {p.title}
                  </motion.h3>
                  <p className="mt-2 text-sm text-[var(--color-ink-dim)]">
                    {p.subtitle}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {p.stack.slice(0, 4).map((s) => (
                      <span
                        key={s}
                        className="rounded border border-white/10 px-2 py-0.5 font-mono text-[10px] text-[var(--color-ink-dim)]"
                      >
                        {s}
                      </span>
                    ))}
                    {p.stack.length > 4 && (
                      <span className="px-1 font-mono text-[10px] text-[var(--color-ink-dim)]">
                        +{p.stack.length - 4}
                      </span>
                    )}
                  </div>

                  <span
                    className="absolute bottom-5 right-6 font-mono text-sm opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
                    style={{ color: p.accent }}
                  >
                    раскрыть →
                  </span>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {active && (
          <ProjectDetail project={active} onClose={() => setActive(null)} />
        )}
      </AnimatePresence>
    </section>
  )
}
