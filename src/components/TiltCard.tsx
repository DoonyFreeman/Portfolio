import { useRef, type ReactNode } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'

/**
 * 3D-tilt карточка с неон-glow и бликом, следующим за курсором.
 * При reduced-motion наклон отключается.
 */
export default function TiltCard({
  children,
  className = '',
  onClick,
  max = 12,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
  max?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  const onMove = (e: React.MouseEvent) => {
    if (reduced || !ref.current) return
    const el = ref.current
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    const rx = (0.5 - py) * max
    const ry = (px - 0.5) * max
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`
    el.style.setProperty('--mx', `${px * 100}%`)
    el.style.setProperty('--my', `${py * 100}%`)
  }
  const onLeave = () => {
    if (ref.current)
      ref.current.style.transform =
        'perspective(900px) rotateX(0) rotateY(0) translateZ(0)'
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onClick}
      className={`tilt-card relative transition-transform duration-200 ease-out ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Блик за курсором */}
      <div
        className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(380px circle at var(--mx,50%) var(--my,50%), rgba(0,240,255,0.18), transparent 60%)',
        }}
      />
      {children}
    </div>
  )
}
