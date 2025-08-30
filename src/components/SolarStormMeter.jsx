import React from 'react'

export default function SolarStormMeter({ summary }){
  if(!summary){
    return (
      <section className="lcars p-4 rounded bg-gradient-to-br from-black to-zinc-900">
        <div className="text-sm">Loading solar activity…</div>
      </section>
    )
  }

  const { strongestClass, cmeCount, counts, severityPct } = summary
  const label =
    strongestClass === 'X' ? 'Severe' :
    strongestClass === 'M' ? 'High' :
    strongestClass === 'C' ? 'Moderate' :
    strongestClass === 'B' ? 'Low' : 'Quiet'

  return (
    <section className="lcars p-4 rounded bg-gradient-to-br from-black to-zinc-900">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-xl">Solar Storm Meter</h2>
        <span className="text-cyan-400 text-xs">DONKI</span>
      </div>

      <div className="text-cyan-100 text-sm">
        <div className="mb-2">Strongest flare (≈3 days): <b>{strongestClass}</b> &nbsp;|&nbsp; CMEs: <b>{cmeCount}</b></div>
        <div className="w-full h-3 bg-cyan-500/10 rounded overflow-hidden border border-cyan-500/30">
          <div className="h-full bg-cyan-400" style={{ width: `${severityPct}%` }} />
        </div>
        <div className="mt-1 text-xs opacity-80">Severity: {label}</div>

        <ul className="mt-3 text-xs opacity-80 grid grid-cols-5 gap-2">
          {['A','B','C','M','X'].map(k=>(
            <li key={k} className="p-2 border border-cyan-500/30 rounded text-center">
              {k} <div className="text-[11px]">{counts?.[k] ?? 0}</div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
