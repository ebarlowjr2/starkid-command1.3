import React, { useEffect, useRef, useState } from 'react'

// Level I finale (Chunk 4). Purely presentational: once the capstone mission is
// graded complete (launchReady), the cadet ignites Aurora — final go/no-go →
// 10-count → IGNITION → liftoff → Level I recognition. It never grades and is
// not required for submission; the capstone terminal_mission is the real gate.
// Rewards (XP/badge) are granted by the lesson player's Submit after liftoff.

const COUNT_FROM = 10

export default function LaunchSequenceBlock({ block, launchReady }) {
  // phase: 'armed' → 'counting' → 'launched'
  const [phase, setPhase] = useState('armed')
  const [count, setCount] = useState(COUNT_FROM)
  const timerRef = useRef(null)

  useEffect(() => () => clearInterval(timerRef.current), [])

  // If the cadet leaves and returns after passing, keep them at the armed gate.
  useEffect(() => {
    if (!launchReady) {
      clearInterval(timerRef.current)
      setPhase('armed')
      setCount(COUNT_FROM)
    }
  }, [launchReady])

  const ignite = () => {
    if (phase !== 'armed') return
    setPhase('counting')
    setCount(COUNT_FROM)
    timerRef.current = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current)
          setPhase('launched')
          return 0
        }
        return c - 1
      })
    }, 700)
  }

  if (!launchReady) {
    return (
      <div>
        <div className="text-xs text-amber-200/80 font-mono">LAUNCH CONTROL</div>
        <h2 className="text-lg text-white font-bold mt-2">{block.heading || 'Aurora Launch'}</h2>
        <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-amber-100 text-sm whitespace-pre-wrap font-mono">
          {block.holdMessage ||
            'LAUNCH STATUS: HOLD — complete final launch readiness before ignition.'}
        </div>
      </div>
    )
  }

  return (
    <div>
      <style>{`
        @keyframes skc-liftoff {
          0% { transform: translateY(0) scale(1); }
          15% { transform: translateY(-6px) scale(1.02); }
          100% { transform: translateY(-320px) scale(0.6); opacity: 0.15; }
        }
        @keyframes skc-flame {
          0%,100% { transform: scaleY(1) scaleX(1); opacity: 0.9; }
          50% { transform: scaleY(1.4) scaleX(0.8); opacity: 1; }
        }
        @keyframes skc-shake {
          0%,100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }
        .skc-rocket-launched { animation: skc-liftoff 2.6s cubic-bezier(.4,0,.6,1) forwards; }
        .skc-rocket-counting { animation: skc-shake 0.25s linear infinite; }
        .skc-flame { transform-origin: top center; animation: skc-flame 0.18s ease-in-out infinite; }
      `}</style>

      <div className="text-xs text-cyan-200/70 font-mono">LAUNCH CONTROL</div>
      <h2 className="text-lg text-white font-bold mt-2">{block.heading || 'Aurora Launch'}</h2>

      {/* Final go/no-go banner */}
      <pre className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-200 text-sm font-mono whitespace-pre-wrap">
{block.authorizedMessage || 'FINAL GO/NO-GO COMPLETE\nALL STATIONS: GO\nAURORA LAUNCH AUTHORIZED'}
      </pre>

      {/* Launch stage */}
      <div className="mt-4 relative overflow-hidden rounded-lg border border-cyan-500/30 bg-gradient-to-b from-black via-[#050a1f] to-[#0a1533] h-64 flex flex-col items-center justify-end">
        {/* stars */}
        <div className="pointer-events-none absolute inset-0 opacity-60"
          style={{ backgroundImage: 'radial-gradient(1px 1px at 20% 30%, #fff, transparent), radial-gradient(1px 1px at 70% 20%, #cfe3ff, transparent), radial-gradient(1px 1px at 40% 60%, #fff, transparent), radial-gradient(1px 1px at 85% 50%, #9fc3ff, transparent), radial-gradient(1px 1px at 55% 80%, #fff, transparent)' }}
        />
        {/* countdown overlay */}
        {phase === 'counting' ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-7xl font-mono font-bold text-cyan-100 drop-shadow-[0_0_18px_rgba(34,211,238,0.7)]">
              {count}
            </div>
          </div>
        ) : null}
        {phase === 'launched' ? (
          <div className="absolute top-3 inset-x-0 flex items-center justify-center">
            <div className="text-2xl font-mono font-bold text-orange-300 drop-shadow-[0_0_18px_rgba(251,146,60,0.8)] tracking-widest">
              IGNITION
            </div>
          </div>
        ) : null}

        {/* rocket */}
        <div
          className={`relative z-10 mb-2 flex flex-col items-center ${
            phase === 'launched' ? 'skc-rocket-launched' : phase === 'counting' ? 'skc-rocket-counting' : ''
          }`}
        >
          <div className="text-5xl leading-none">🚀</div>
          {phase !== 'armed' ? (
            <div className="skc-flame mt-[-4px] h-10 w-4 rounded-b-full bg-gradient-to-b from-yellow-200 via-orange-400 to-red-500 blur-[1px]" />
          ) : null}
        </div>
      </div>

      {/* controls / result */}
      {phase === 'armed' ? (
        <button
          type="button"
          onClick={ignite}
          className="mt-4 w-full px-4 py-3 rounded-lg border border-orange-400/50 bg-orange-500/20 text-orange-100 font-mono text-sm hover:bg-orange-500/30 transition"
        >
          ▶ IGNITE AURORA
        </button>
      ) : null}

      {phase === 'launched' ? (
        <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
          {block.badgeLabel ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/50 bg-yellow-500/15 px-3 py-1 text-yellow-100 text-xs font-mono">
              🏅 {block.badgeLabel}
            </div>
          ) : null}
          <div className="mt-3 text-emerald-100 text-sm">
            {block.completionMessage || 'Aurora is airborne — outstanding work, cadet.'}
          </div>
          {block.nextSteps?.length ? (
            <ul className="mt-3 text-emerald-200/80 text-xs list-disc pl-4">
              {block.nextSteps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          ) : null}
          <div className="mt-3 text-cyan-200/70 text-xs font-mono">
            Press Submit below to log your launch clearance and claim Level I.
          </div>
        </div>
      ) : null}
    </div>
  )
}
