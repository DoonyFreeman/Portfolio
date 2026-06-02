import { useEffect, useRef } from 'react'
import { readEnergy, decayEnergy } from '../hooks/scrollVelocity'

/**
 * Canvas-фон: сетка эквалайзер-баров снизу + парящие частицы.
 * Амплитуда баров и скорость частиц зависят от энергии скролла —
 * получается «аудио-реактивность» без реального звука.
 */
export default function Background({ reduced }: { reduced: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    let raf = 0
    let w = 0
    let h = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const BARS = 64
    const phases = Array.from({ length: BARS }, () => Math.random() * Math.PI * 2)

    type P = { x: number; y: number; vx: number; vy: number; r: number; hue: number }
    const COUNT = reduced ? 26 : 70
    let particles: P[] = []

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      particles = Array.from({ length: COUNT }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.8 + 0.4,
        hue: Math.random() > 0.5 ? 320 : 190,
      }))
    }
    resize()
    window.addEventListener('resize', resize)

    let t = 0
    const draw = () => {
      t += 0.016
      const energy = readEnergy()
      decayEnergy(0.94)

      ctx.clearRect(0, 0, w, h)

      // Лёгкий радиальный градиент-дыхание
      const g = ctx.createRadialGradient(w * 0.5, h * 0.35, 0, w * 0.5, h * 0.35, h)
      g.addColorStop(0, `rgba(157,75,255,${0.06 + energy * 0.12})`)
      g.addColorStop(1, 'rgba(5,1,13,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)

      // Частицы
      for (const p of particles) {
        const speed = 1 + energy * 6
        p.x += p.vx * speed
        p.y += p.vy * speed
        if (p.x < 0) p.x = w
        if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h
        if (p.y > h) p.y = 0
        const a = 0.25 + energy * 0.5
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r + energy * 1.5, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue}, 100%, 65%, ${a})`
        ctx.fill()
      }

      // Эквалайзер снизу
      const barW = w / BARS
      for (let i = 0; i < BARS; i++) {
        const center = Math.abs(i - BARS / 2) / (BARS / 2)
        const base = (1 - center) * 0.5 + 0.12
        const wobble = (Math.sin(t * 2 + phases[i]) * 0.5 + 0.5) * 0.4
        const amp = (base + wobble) * (0.25 + energy * 1.6)
        const bh = amp * h * 0.5
        const x = i * barW
        const hue = i % 2 === 0 ? 320 : 190
        const grad = ctx.createLinearGradient(0, h, 0, h - bh)
        grad.addColorStop(0, `hsla(${hue},100%,60%,${0.0})`)
        grad.addColorStop(1, `hsla(${hue},100%,62%,${0.32 + energy * 0.4})`)
        ctx.fillStyle = grad
        ctx.fillRect(x + barW * 0.18, h - bh, barW * 0.64, bh)
      }

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [reduced])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
    />
  )
}
