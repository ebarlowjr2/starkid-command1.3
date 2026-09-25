import React, { useCallback, useEffect, useRef, useState } from 'react'

// A polished, keyboard-first terminal UI. It is intentionally backend-agnostic:
// it talks only to the `backend` contract (see terminal/terminalBackend.js), so
// the same component works over the Phase-1 emulator today and a real PTY later.
//
// It honestly reflects a line-based command engine: type a command, press Enter,
// see combined output. No cursor addressing or interactive programs are faked.

let lineSeq = 0
function makeLine(kind, text) {
  lineSeq += 1
  return { key: `l${lineSeq}`, kind, text }
}

export default function Terminal({ backend, onAfterCommand, welcome }) {
  const [lines, setLines] = useState(() =>
    welcome ? welcome.map((t) => makeLine('system', t)) : []
  )
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1) // -1 == editing a fresh line

  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  // Keep the newest output in view.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  const focusInput = useCallback(() => {
    // Don't steal focus if the user is selecting text to copy.
    const sel = typeof window !== 'undefined' ? window.getSelection?.() : null
    if (sel && sel.toString().length > 0) return
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    focusInput()
  }, [focusInput])

  const runCommand = useCallback(
    (raw) => {
      const prompt = backend.getPrompt()
      const command = raw
      const next = [makeLine('input', `${prompt} ${command}`)]

      const result = backend.run(command)

      if (result.clear) {
        setLines([])
      } else {
        if (result.output) {
          const kind = result.exitCode === 0 ? 'output' : 'error'
          for (const text of result.output.replace(/\n$/, '').split('\n')) {
            next.push(makeLine(kind, text))
          }
        }
        setLines((prev) => [...prev, ...next])
      }

      if (raw.trim().length > 0) {
        setHistory((prev) => (prev[prev.length - 1] === raw ? prev : [...prev, raw]))
      }
      setHistoryIndex(-1)
      setInput('')
      onAfterCommand?.()
    },
    [backend, onAfterCommand]
  )

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      runCommand(input)
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length === 0) return
      const idx = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1)
      setHistoryIndex(idx)
      setInput(history[idx])
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex === -1) return
      const idx = historyIndex + 1
      if (idx >= history.length) {
        setHistoryIndex(-1)
        setInput('')
      } else {
        setHistoryIndex(idx)
        setInput(history[idx])
      }
      return
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'l' || e.key === 'L')) {
      // Ctrl+L clears the screen, matching shell muscle memory.
      e.preventDefault()
      setLines([])
    }
  }

  return (
    <div
      className="flex flex-col h-full min-h-[18rem] rounded-lg border border-cyan-500/30 bg-black/80 overflow-hidden"
      onClick={focusInput}
    >
      <div className="flex items-center gap-2 px-3 py-2 border-b border-cyan-500/20 bg-black/60">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" aria-hidden="true" />
        <span className="ml-2 text-[11px] font-mono text-cyan-200/60">
          starkid-terminal — Linux mission console
        </span>
      </div>

      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-label="Terminal output"
        className="flex-1 overflow-y-auto px-3 py-2 font-mono text-[13px] leading-relaxed"
      >
        {lines.map((line) => (
          <div
            key={line.key}
            className={
              line.kind === 'input'
                ? 'text-cyan-300 whitespace-pre-wrap break-words'
                : line.kind === 'error'
                ? 'text-red-300 whitespace-pre-wrap break-words'
                : line.kind === 'system'
                ? 'text-cyan-200/60 whitespace-pre-wrap break-words'
                : 'text-emerald-200/90 whitespace-pre-wrap break-words'
            }
          >
            {line.text.length ? line.text : ' '}
          </div>
        ))}

        <div className="flex items-start text-emerald-200/90">
          <span className="text-cyan-300 whitespace-pre shrink-0">{backend.getPrompt()} </span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoCapitalize="none"
            autoCorrect="off"
            aria-label="Command input"
            className="flex-1 bg-transparent border-0 outline-none text-emerald-100 font-mono text-[13px] placeholder:text-white/20"
            placeholder="type a command and press Enter"
          />
        </div>
      </div>
    </div>
  )
}
