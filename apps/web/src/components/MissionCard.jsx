import React from 'react'
export default function MissionCard({ title, subtitle, content }){
  return (
    <section className="lcars p-4 rounded bg-gradient-to-br from-black to-zinc-900">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-xl">{title}</h2>
        <span className="text-cyan-400 text-xs">{subtitle}</span>
      </div>
      <div className="text-cyan-100">{content}</div>
    </section>
  )
}
