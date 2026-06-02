/**
 * Глобальный «энергетический» сигнал скролла. Lenis шлёт сюда скорость,
 * а фон/частицы её читают — так создаётся имитация аудио-реактивности без звука.
 */
let energy = 0

export function pushScrollVelocity(velocity: number) {
  // Нормализуем и накапливаем «бас» по модулю скорости.
  const v = Math.min(Math.abs(velocity) / 30, 1)
  energy = Math.max(energy, v)
}

export function readEnergy(): number {
  return energy
}

/** Плавное затухание энергии — вызывается раз в кадр из фона. */
export function decayEnergy(factor = 0.92) {
  energy *= factor
  if (energy < 0.0005) energy = 0
}
