import React from 'react'

export default function StemActivitiesPage() {
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-wider text-cyan-400 font-mono mb-2">
          STEM ACTIVITIES
        </h2>
        <p className="text-sm text-cyan-200/70 font-mono">
          Hands-on challenges and experiments are landing soon.
        </p>
      </div>

      <div
        style={{
          padding: 24,
          borderRadius: 18,
          border: '2px dashed rgba(34, 211, 238, 0.4)',
          background: 'rgba(0,0,0,0.45)',
        }}
      >
        <div className="text-lg text-cyan-300 font-semibold mb-2">Coming Soon</div>
        <p className="text-cyan-200/70 text-sm leading-relaxed">
          We are building a library of STEM activities, missions, and mini-labs that pair with
          live space data. Check back soon.
        </p>
      </div>
    </div>
  )
}
