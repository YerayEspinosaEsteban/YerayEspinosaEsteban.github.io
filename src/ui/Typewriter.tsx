import { useEffect, useState } from 'react'

/** Classic RPG text reveal. Click/space on the parent can call `skip`. */
export function useTypewriter(text: string, speed = 22) {
  const [n, setN] = useState(0)
  useEffect(() => {
    setN(0)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setN(text.length); return }
    const id = setInterval(() => setN((v) => (v >= text.length ? (clearInterval(id), v) : v + 1)), speed)
    return () => clearInterval(id)
  }, [text, speed])
  return { shown: text.slice(0, n), done: n >= text.length, skip: () => setN(text.length) }
}

export function Typewriter({ text, className }: { text: string; className?: string }) {
  const { shown, done } = useTypewriter(text)
  return (
    <p className={className} aria-label={text}>
      <span aria-hidden="true">{shown}</span>
      {done && <span aria-hidden="true" className="blink ml-1">▼</span>}
    </p>
  )
}
