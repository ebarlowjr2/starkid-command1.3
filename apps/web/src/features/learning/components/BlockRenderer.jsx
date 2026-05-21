import React from 'react'
import QuestionNumericBlock from './blocks/QuestionNumericBlock.jsx'
import QuestionShortTextBlock from './blocks/QuestionShortTextBlock.jsx'
import QuestionChoiceBlock from './blocks/QuestionChoiceBlock.jsx'

export default function BlockRenderer({ block, value, onChange, onCheckpoint }) {
  switch (block.type) {
    case 'mission_brief':
      return (
        <div>
          <div className="text-xs text-cyan-200/70 font-mono">MISSION BRIEF</div>
          <h2 className="text-lg text-white font-bold mt-2">{block.heading}</h2>
          <p className="text-white/80 mt-2">{block.body}</p>
          {block.context ? <p className="text-white/60 mt-3 text-sm">{block.context}</p> : null}
          {block.stats?.length ? (
            <ul className="mt-3 text-xs text-cyan-200/70 list-disc pl-4">
              {block.stats.map((stat) => <li key={stat}>{stat}</li>)}
            </ul>
          ) : null}
        </div>
      )
    case 'concept':
      return (
        <div>
          <h2 className="text-white text-lg font-bold">{block.title || 'Concept'}</h2>
          <p className="text-white/80 mt-2">{block.body}</p>
          {block.bullets?.length ? (
            <ul className="mt-3 text-white/70 text-sm list-disc pl-4">
              {block.bullets.map((item) => <li key={item}>{item}</li>)}
            </ul>
          ) : null}
        </div>
      )
    case 'instruction':
      return (
        <div>
          <h2 className="text-white text-lg font-bold">Instructions</h2>
          <ol className="mt-3 text-white/80 text-sm list-decimal pl-4">
            {block.steps.map((step) => <li key={step}>{step}</li>)}
          </ol>
          {block.workedExample ? (
            <div className="mt-4 pt-3 border-t border-cyan-500/20">
              <div className="text-white text-lg font-bold">Worked Example</div>
              <div className="mt-2 text-white/80 text-sm">{block.workedExample.problem}</div>
              <div className="mt-3 text-cyan-200/80 text-sm">{block.workedExample.solution}</div>
              {block.workedExample.steps?.length ? (
                <ul className="mt-3 text-white/70 text-sm list-disc pl-4">
                  {block.workedExample.steps.map((s) => <li key={s}>{s}</li>)}
                </ul>
              ) : null}
            </div>
          ) : null}
        </div>
      )
    case 'worked_example':
      return (
        <div>
          <h2 className="text-white text-lg font-bold">Worked Example</h2>
          <div className="mt-2 text-white/80">{block.problem}</div>
          <div className="mt-3 text-cyan-200/80 text-sm">{block.solution}</div>
          {block.steps?.length ? (
            <ul className="mt-3 text-white/70 text-sm list-disc pl-4">
              {block.steps.map((step) => <li key={step}>{step}</li>)}
            </ul>
          ) : null}
        </div>
      )
    case 'question_numeric':
      return <QuestionNumericBlock block={block} value={value} onChange={onChange} />
    case 'question_short_text':
      return <QuestionShortTextBlock block={block} value={value} onChange={onChange} />
    case 'question_multiple_choice':
      return <QuestionChoiceBlock block={block} value={value} onChange={onChange} />
    case 'hint':
      return (
        <div className="text-white/70 text-sm border border-purple-500/30 bg-purple-500/10 rounded p-3">
          HINT: {block.text}
        </div>
      )
    case 'checkpoint':
      return (
        <div>
          <div className="text-white/80">{block.prompt}</div>
          <button
            onClick={() => onCheckpoint(true)}
            className={`mt-3 px-3 py-2 rounded border ${value ? 'border-cyan-400 bg-cyan-500/20 text-cyan-100' : 'border-cyan-500/30 bg-black/40 text-white/80'}`}
          >
            {value ? 'Checkpoint Complete' : 'Acknowledge'}
          </button>
        </div>
      )
    case 'submission_prompt':
      return (
        <div>
          <div className="text-white/80">{block.prompt}</div>
          <div className="text-white/60 text-sm mt-2">{block.instruction}</div>
          {block.checkpointQuiz?.questions?.length ? (
            <div className="mt-4 pt-3 border-t border-cyan-500/20">
              <div className="text-xs text-cyan-200/70 font-mono">
                {block.checkpointQuiz.title || 'Final Checkpoint'}
              </div>
              <div className="mt-3 flex flex-col gap-4">
                {block.checkpointQuiz.questions.map((q) => {
                  const obj = value && typeof value === 'object' ? value : {}
                  const qValue = obj[q.id]
                  const setQValue = (next) => onChange({ ...obj, [q.id]: next })
                  return (
                    <div key={q.id} className="flex flex-col gap-2">
                      <div className="text-white/80 text-sm">{q.prompt}</div>
                      {q.type === 'numeric' ? (
                        <div className="flex flex-col gap-1">
                          <input
                            className="bg-black/50 border border-cyan-500/30 rounded px-3 py-2 text-white/90 text-sm"
                            value={qValue ?? ''}
                            onChange={(e) => setQValue(e.target.value)}
                            inputMode="numeric"
                          />
                          {q.unit ? <div className="text-white/50 text-xs">Unit: {q.unit}</div> : null}
                        </div>
                      ) : q.type === 'short_text' ? (
                        <textarea
                          className="bg-black/50 border border-cyan-500/30 rounded px-3 py-2 text-white/90 text-sm"
                          rows={3}
                          value={qValue ?? ''}
                          onChange={(e) => setQValue(e.target.value)}
                        />
                      ) : (
                        <div className="flex flex-col gap-2">
                          {q.choices.map((c) => (
                            <button
                              key={c.id}
                              onClick={() => setQValue(c.id)}
                              className={`px-3 py-2 rounded border text-left text-sm ${qValue === c.id ? 'border-cyan-400 bg-cyan-500/20 text-cyan-100' : 'border-cyan-500/30 bg-black/40 text-white/80'}`}
                            >
                              {c.text}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ) : null}
        </div>
      )
    case 'completion':
      return (
        <div>
          <div className="text-white/80">{block.message}</div>
          {block.nextSteps?.length ? (
            <ul className="mt-3 text-white/70 text-sm list-disc pl-4">
              {block.nextSteps.map((step) => <li key={step}>{step}</li>)}
            </ul>
          ) : null}
        </div>
      )
    default:
      return <div className="text-white/70">Unsupported block</div>
  }
}
