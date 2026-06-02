import { useReveal } from '../../hooks/useReveal'
import Marquee from '../Marquee'

type Group = { title: string; items: { name: string; level: number }[] }

const GROUPS: Group[] = [
  {
    title: 'Core',
    items: [
      { name: 'Python', level: 92 },
      { name: 'FastAPI', level: 90 },
      { name: 'async / await', level: 88 },
      { name: 'Pydantic v2', level: 85 },
    ],
  },
  {
    title: 'Data',
    items: [
      { name: 'PostgreSQL', level: 85 },
      { name: 'SQLAlchemy 2.0', level: 86 },
      { name: 'Alembic', level: 80 },
      { name: 'Redis', level: 82 },
    ],
  },
  {
    title: 'Infra & Async',
    items: [
      { name: 'Celery', level: 80 },
      { name: 'RabbitMQ', level: 74 },
      { name: 'Kafka', level: 72 },
      { name: 'Docker', level: 82 },
    ],
  },
  {
    title: 'Beyond',
    items: [
      { name: 'Go', level: 60 },
      { name: 'Spring Boot', level: 58 },
      { name: 'PyTorch / CV', level: 64 },
      { name: 'pytest', level: 78 },
    ],
  },
]

const STRIP = [
  'FastAPI',
  'SQLAlchemy',
  'asyncpg',
  'Redis',
  'Celery',
  'RabbitMQ',
  'Kafka',
  'Docker',
  'Nginx',
  'JWT',
  'Pydantic',
  'Alembic',
]

export default function TechStack({ reduced }: { reduced: boolean }) {
  const ref = useReveal<HTMLElement>(!reduced)

  return (
    <section ref={ref} id="stack" className="relative z-10 px-6 py-24 md:px-12">
      <div className="mb-12 border-y border-white/10 bg-black/20 py-4 font-display text-3xl font-bold uppercase tracking-tight text-[var(--color-neon-violet)]/40 md:text-5xl">
        <Marquee items={STRIP} duration={reduced ? 999999 : 32} reverse />
      </div>

      <div className="mx-auto max-w-6xl">
        <p className="reveal mb-4 font-mono text-xs uppercase tracking-[0.4em] text-[var(--color-neon-cyan)]">
          // stack
        </p>
        <h2 className="reveal mb-12 font-display text-4xl font-bold md:text-6xl">
          Инструменты
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {GROUPS.map((g) => (
            <div
              key={g.title}
              className="reveal rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm transition-colors hover:border-[var(--color-neon-magenta)]/40"
            >
              <h3 className="mb-5 font-mono text-xs uppercase tracking-widest text-[var(--color-neon-magenta)]">
                {g.title}
              </h3>
              <ul className="space-y-4">
                {g.items.map((it) => (
                  <li key={it.name}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="text-[var(--color-ink)]">{it.name}</span>
                      <span className="font-mono text-[10px] text-[var(--color-ink-dim)]">
                        {it.level}
                      </span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${it.level}%`,
                          background:
                            'linear-gradient(90deg, var(--color-neon-magenta), var(--color-neon-cyan))',
                          boxShadow: '0 0 12px rgba(0,240,255,0.5)',
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
