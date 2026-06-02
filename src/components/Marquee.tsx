/** Бесконечная бегущая строка. Контент дублируется для бесшовного цикла. */
export default function Marquee({
  items,
  duration = 28,
  reverse = false,
  className = '',
}: {
  items: string[]
  duration?: number
  reverse?: boolean
  className?: string
}) {
  const seq = [...items, ...items]
  return (
    <div className={`overflow-hidden ${className}`}>
      <div
        className="marquee-track"
        style={{
          ['--marquee-duration' as string]: `${duration}s`,
          animationDirection: reverse ? 'reverse' : 'normal',
        }}
      >
        {seq.map((it, i) => (
          <span key={i} className="mx-6 inline-flex items-center gap-6">
            <span>{it}</span>
            <span className="text-[var(--color-neon-magenta)]">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}
