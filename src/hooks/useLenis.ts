import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { pushScrollVelocity } from './scrollVelocity'

gsap.registerPlugin(ScrollTrigger)

/**
 * Инициализирует инерционный скролл Lenis и связывает его с GSAP ScrollTrigger.
 * При reduced-motion smooth-скролл отключается. Возвращает экземпляр через ref-колбэк.
 */
export function useLenis(enabled: boolean, onLenis?: (l: Lenis | null) => void) {
  useEffect(() => {
    if (!enabled) {
      onLenis?.(null)
      return
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
    })

    lenis.on('scroll', (e: { velocity: number }) => {
      pushScrollVelocity(e.velocity)
      ScrollTrigger.update()
    })

    const raf = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    onLenis?.(lenis)

    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
      onLenis?.(null)
    }
  }, [enabled, onLenis])
}
