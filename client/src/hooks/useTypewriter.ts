import { useState, useEffect, useRef } from 'react'

interface Options {
  speed?: number        // ms per character (default 40)
  pauseBetween?: number // ms pause after each line before starting next (default 800)
  startDelay?: number   // ms before typing begins (default 400)
}

interface Result {
  lines: string[]   // fully-typed lines so far
  current: string   // the line currently being typed
  done: boolean     // all lines complete
}

export function useTypewriter(targetLines: string[], options: Options = {}): Result {
  const { speed = 40, pauseBetween = 800, startDelay = 400 } = options

  const [lineIndex, setLineIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [completedLines, setCompletedLines] = useState<string[]>([])
  const [started, setStarted] = useState(false)
  // Ref to track whether we are in the between-line pause so we don't
  // double-schedule when an unrelated re-render fires the effect.
  const pausingRef = useRef(false)

  // One-time start delay
  useEffect(() => {
    const t = setTimeout(() => setStarted(true), startDelay)
    return () => clearTimeout(t)
  }, [startDelay])

  // Character-by-character typing + line advance
  useEffect(() => {
    if (!started) return
    if (lineIndex >= targetLines.length) return
    if (pausingRef.current) return

    const line = targetLines[lineIndex]

    if (charIndex < line.length) {
      const t = setTimeout(() => setCharIndex(i => i + 1), speed)
      return () => clearTimeout(t)
    }

    // Line fully typed — pause, then advance to next line (no state change)
    pausingRef.current = true
    const t = setTimeout(() => {
      pausingRef.current = false
      setCompletedLines(prev => [...prev, line])
      setLineIndex(i => i + 1)
      setCharIndex(0)
    }, pauseBetween)
    return () => {
      clearTimeout(t)
      pausingRef.current = false
    }
  }, [started, lineIndex, charIndex, targetLines, speed, pauseBetween])

  const allDone = completedLines.length === targetLines.length && targetLines.length > 0
  const current = allDone || !targetLines[lineIndex]
    ? ''
    : targetLines[lineIndex].slice(0, charIndex)

  return { lines: completedLines, current, done: allDone }
}
