import type { ElementType, ReactNode } from 'react'

/** Текст с RGB-глитч-слоями (через CSS ::before/::after по data-text). */
export default function GlitchText({
  text,
  as: Tag = 'span',
  className = '',
}: {
  text: string
  as?: ElementType
  className?: string
}): ReactNode {
  return (
    <Tag className={`glitch ${className}`} data-text={text}>
      {text}
    </Tag>
  )
}
