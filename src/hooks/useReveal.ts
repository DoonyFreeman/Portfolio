import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

/**
 * Reveal дочерних элементов с классом `.reveal` при попадании секции во вьюпорт.
 * Делает staggered «бас-дроп»: резкое появление со скейлом и сдвигом.
 */
export function useReveal<T extends HTMLElement>(enabled: boolean) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (!enabled) {
      gsap.set(el.querySelectorAll('.reveal'), { opacity: 1, y: 0, scale: 1 })
      return
    }

    const targets = el.querySelectorAll('.reveal')
    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { opacity: 0, y: 48, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.9,
          ease: 'expo.out',
          stagger: 0.08,
          scrollTrigger: {
            trigger: el,
            start: 'top 78%',
          },
        },
      )
    }, el)

    return () => ctx.revert()
  }, [enabled])

  return ref
}
