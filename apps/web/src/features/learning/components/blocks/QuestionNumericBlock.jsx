import React from 'react'

export default function QuestionNumericBlock({ block, value, onChange }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="text-white text-base">{block.prompt}</div>
      <input
        type="number"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={block.inputLabel || 'Enter value'}
        className="px-3 py-2 rounded border border-cyan-500/40 bg-black/40 text-white"
      />
      {block.unit ? <div className="text-xs text-cyan-200/60">Unit: {block.unit}</div> : null}
    </div>
  )
}
