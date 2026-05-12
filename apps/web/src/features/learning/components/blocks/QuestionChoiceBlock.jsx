import React from 'react'

export default function QuestionChoiceBlock({ block, value, onChange }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="text-white text-base">{block.prompt}</div>
      <div className="flex flex-col gap-2">
        {block.choices.map((choice) => (
          <button
            key={choice.id}
            onClick={() => onChange(choice.id)}
            className={`px-3 py-2 rounded border text-left ${value === choice.id ? 'border-cyan-400 bg-cyan-500/20 text-cyan-100' : 'border-cyan-500/30 bg-black/40 text-white/80'}`}
          >
            {choice.text}
          </button>
        ))}
      </div>
    </div>
  )
}
