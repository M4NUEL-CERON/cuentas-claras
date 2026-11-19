import type { CSSProperties } from 'react'

/** A burst of cacao beans and sprinkles. Remount (change key) to replay. */
export function Beans() {
  return (
    <div className="beans" aria-hidden="true">
      {Array.from({ length: 16 }, (_, i) => (
        <i key={i} className={`bean k${i % 3}`}
          style={{ '--x': `${(i * 37) % 100}%`, '--d': `${(i * 53) % 380}ms`, '--r': `${(i * 71) % 360}deg`, '--dx': `${((i * 29) % 60) - 30}px` } as CSSProperties} />
      ))}
    </div>
  )
}
