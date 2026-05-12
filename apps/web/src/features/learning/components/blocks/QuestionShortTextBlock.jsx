import React from 'react'

export default function QuestionShortTextBlock({ block, value, onChange }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="text-white text-base">{block.prompt}</div>
      <textarea
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={block.inputLabel || 'Enter response'}
        rows={4}
        className="px-3 py-2 rounded border border-cyan-500/40 bg-black/40 text-white"
      />
      {block.exampleAnswer ? (
        <div className="text-xs text-cyan-200/60">Example: {block.exampleAnswer}</div>
      ) : null}
    </div>
  )
}
