import { useRef, type ReactNode } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'

/**
 * Кнопка/ссылка с «магнитным» эффектом: содержимое тянется к курсору.
 * Рендерится как <a>, если задан href, иначе <button>.
 */
export default function MagneticButton({
  children,
  href,
  onClick,
  className = '',
  strength = 0.4,
}: {
  children: ReactNode
  href?: string
  onClick?: () => void
  className?: string
  strength?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotion()

  const onMove = (e: React.MouseEvent) => {
    if (reduced || !ref.current) return
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) * strength
    const y = (e.clientY - rect.top - rect.height / 2) * strength
    ref.current.style.transform = `translate(${x}px, ${y}px)`
  }
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = 'translate(0,0)'
  }

  const base =
    'group relative inline-flex items-center justify-center overflow-hidden rounded-full px-7 py-3 font-mono text-sm uppercase tracking-widest transition-transform'
  const inner = (
    <span
      ref={ref}
      className="relative z-10 inline-flex items-center gap-2 transition-transform duration-200 ease-out"
    >
      {children}
    </span>
  )

  const props = {
    className: `${base} ${className}`,
    onMouseMove: onMove,
    onMouseLeave: onLeave,
  }

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" {...props}>
        {inner}
      </a>
    )
  }
  return (
    <button type="button" onClick={onClick} {...props}>
      {inner}
    </button>
  )
}
