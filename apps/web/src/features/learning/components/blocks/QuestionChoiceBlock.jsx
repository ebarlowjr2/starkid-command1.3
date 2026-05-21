import React from 'react'

export default function QuestionChoiceBlock({ block, value, onChange }) {
  const showFeedback = Boolean(value) && typeof block?.answerId === 'string'
  const correct = showFeedback ? value === block.answerId : false
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
      {showFeedback ? (
        <div className={`text-sm ${correct ? 'text-green-300' : 'text-yellow-200'}`}>
          {correct
            ? (block.correctFeedback || 'Good call. This condition is within limits.')
            : (block.incorrectFeedback || 'Not quite. Re-check the limits and conditions before proceeding.')}
        </div>
      ) : null}
    </div>
  )
}
