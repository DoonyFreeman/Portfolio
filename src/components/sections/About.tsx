import { useReveal } from '../../hooks/useReveal'

const STATS = [
  { value: '5+', label: 'Backend-проектов' },
  { value: 'Async', label: 'весь стек I/O' },
  { value: 'МТУСИ', label: 'Москва' },
]

export default function About({ reduced }: { reduced: boolean }) {
  const ref = useReveal<HTMLElement>(!reduced)

  return (
    <section
      ref={ref}
      id="about"
      className="relative z-10 px-6 py-28 md:px-12 md:py-40"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-[0.85fr_1.15fr]">
        {/* Фото с эффектом */}
        <div className="reveal relative mx-auto w-full max-w-sm">
          <div className="group relative aspect-[3/4] overflow-hidden rounded-2xl neon-border">
            <img
              src="me.jpg"
              alt="Артём Ребриков"
              className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
              onError={(e) => {
                ;(e.currentTarget as HTMLImageElement).style.opacity = '0'
              }}
            />
            {/* Дюотон-оверлей */}
            <div
              className="pointer-events-none absolute inset-0 mix-blend-color transition-opacity duration-700 group-hover:opacity-0"
              style={{
                background:
                  'linear-gradient(150deg, rgba(255,31,143,0.55), rgba(0,240,255,0.45))',
              }}
            />
            <div className="grain pointer-events-none absolute inset-0 opacity-30" />
            <div className="pointer-events-none absolute bottom-3 left-3 font-mono text-[10px] uppercase tracking-widest text-[var(--color-neon-cyan)]">
              ● rec · backend.dev
            </div>
          </div>
        </div>

        {/* Текст */}
        <div>
          <p className="reveal mb-4 font-mono text-xs uppercase tracking-[0.4em] text-[var(--color-neon-magenta)]">
            // about
          </p>
          <h2 className="reveal font-display text-4xl font-bold leading-tight md:text-6xl">
            Бэкенд, который{' '}
            <span className="text-glow-cyan text-[var(--color-neon-cyan)]">
              не ложится
            </span>{' '}
            под нагрузкой
          </h2>
          <p className="reveal mt-6 max-w-xl text-[var(--color-ink-dim)] leading-relaxed">
            Я — Артём, Backend-разработчик из Москвы, студент МТУСИ. Пишу
            асинхронные сервисы на Python/FastAPI с акцентом на архитектуру:
            изоляция слоёв, кэширование в Redis, фоновые задачи в Celery,
            событийная обработка через RabbitMQ/Kafka. Покрываю код тестами и
            упаковываю всё в Docker. Параллельно копаю Go и Java Spring Boot.
          </p>

          <div className="reveal mt-10 grid grid-cols-3 gap-4">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center backdrop-blur-sm"
              >
                <div className="font-display text-2xl font-bold text-[var(--color-ink)] md:text-3xl">
                  {s.value}
                </div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-[var(--color-ink-dim)]">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
