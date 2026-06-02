import { useEffect, useRef } from 'react'

/**
 * Кастомный курсор: точка + догоняющее кольцо со свечением и лёгкой
 * хром-аберрацией. На наводимых элементах (a, button, [data-cursor]) растёт.
 */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Только для точных указателей (мышь). На тач — не показываем.
    if (!window.matchMedia('(pointer: fine)').matches) return
    document.body.classList.add('custom-cursor')

    const dot = dotRef.current!
    const ring = ringRef.current!
    let mx = window.innerWidth / 2
    let my = window.innerHeight / 2
    let rx = mx
    let ry = my
    let hovering = false
    let raf = 0

    const onMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
      dot.style.transform = `translate(${mx}px, ${my}px)`
      const t = e.target as HTMLElement
      hovering = !!t.closest('a, button, [data-cursor], .tilt-card')
    }

    const loop = () => {
      rx += (mx - rx) * 0.18
      ry += (my - ry) * 0.18
      const s = hovering ? 2.1 : 1
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%) scale(${s})`
      ring.style.opacity = hovering ? '1' : '0.65'
      raf = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', onMove)
    raf = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
      document.body.classList.remove('custom-cursor')
    }
  }, [])

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[70] -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-white mix-blend-difference"
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[70] h-9 w-9 rounded-full border border-[var(--color-neon-cyan)] transition-[opacity] duration-200"
        style={{
          boxShadow:
            '0 0 14px 1px rgba(0,240,255,0.55), inset 0 0 10px rgba(255,31,143,0.45)',
          mixBlendMode: 'screen',
        }}
      />
    </>
  )
}
