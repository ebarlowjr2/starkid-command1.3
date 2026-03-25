import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getLessonBySlug } from '@starkid/core'
import {
  initLessonPlayer,
  setAnswer,
  validateCurrentBlock,
  goNext,
  goPrev,
  submitLesson,
} from '@starkid/core'
import LessonHeader from '../components/LessonHeader.jsx'
import BlockRenderer from '../components/BlockRenderer.jsx'

export default function LessonPlayerScreen() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [lesson, setLesson] = useState(null)
  const [state, setState] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const lessonData = getLessonBySlug(slug)
    if (!lessonData) {
      setError('Lesson not found')
      return
    }
    setLesson(lessonData)
    setState(initLessonPlayer(lessonData))
  }, [slug])

  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-400 font-mono">{error}</div>
      </div>
    )
  }

  if (!lesson || !state) {
    return (
      <div className="p-4">
        <div className="text-cyan-200/70 font-mono">Loading lesson...</div>
      </div>
    )
  }

  const block = lesson.blocks[state.activeIndex]
  const value = state.answers[block.id]
  const validation = state.validation[block.id]

  const handleAnswer = (val) => {
    setState((prev) => setAnswer(prev, block.id, val))
  }

  const handleNext = () => {
    setState((prev) => validateCurrentBlock(lesson, prev))
    setState((prev) => goNext(lesson, prev))
  }

  const handlePrev = () => setState((prev) => goPrev(prev))

  const handleSubmit = () => {
    const result = submitLesson(lesson, state)
    setState(result.nextState)
  }

  return (
    <div className="p-4 min-h-screen">
      <button
        onClick={() => navigate('/learning/stem')}
        className="mb-4 px-3 py-2 rounded border border-cyan-500/30 bg-black/40 text-cyan-200 text-xs"
      >
        ← BACK TO STEM
      </button>

      <LessonHeader lesson={lesson} activeIndex={state.activeIndex} totalBlocks={state.totalBlocks} />

      <div className="p-4 rounded-xl border border-cyan-500/30 bg-black/40">
        <BlockRenderer
          block={block}
          value={value}
          onChange={handleAnswer}
          onCheckpoint={handleAnswer}
        />
        {validation && !validation.valid ? (
          <div className="text-red-300 text-xs mt-2">{validation.message}</div>
        ) : null}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={handlePrev}
          disabled={state.activeIndex === 0}
          className="px-3 py-2 rounded border border-cyan-500/30 bg-black/40 text-cyan-200 text-xs disabled:opacity-50"
        >
          Back
        </button>
        {state.activeIndex < lesson.blocks.length - 1 ? (
          <button
            onClick={handleNext}
            className="px-3 py-2 rounded border border-cyan-500/30 bg-cyan-500/20 text-cyan-200 text-xs"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-3 py-2 rounded border border-cyan-500/30 bg-cyan-500/20 text-cyan-200 text-xs"
          >
            Submit to Command
          </button>
        )}
      </div>

      {state.submitState === 'success' ? (
        <div className="mt-4 p-3 rounded border border-green-500/30 bg-green-500/10 text-green-200 text-sm">
          Submission received. Command review will follow.
        </div>
      ) : null}

      {state.submitState === 'error' ? (
        <div className="mt-4 p-3 rounded border border-red-500/30 bg-red-500/10 text-red-200 text-sm">
          {state.submitError}
        </div>
      ) : null}
    </div>
  )
}
