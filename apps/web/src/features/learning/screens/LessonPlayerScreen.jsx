import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getLessonBySlug, getSession } from '@starkid/core'
import {
  initLessonPlayer,
  hydrateLessonPlayer,
  setAnswer,
  validateCurrentBlock,
  goNext,
  goPrev,
  submitLesson,
  getLearningModuleByLessonSlug,
  startModuleProgress,
  saveModuleProgress,
  submitModuleForUser,
  completeModuleProgress,
} from '@starkid/core'
import LessonHeader from '../components/LessonHeader.jsx'
import BlockRenderer from '../components/BlockRenderer.jsx'

export default function LessonPlayerScreen() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [lesson, setLesson] = useState(null)
  const [module, setModule] = useState(null)
  const [state, setState] = useState(null)
  const [error, setError] = useState(null)
  const [progressLoaded, setProgressLoaded] = useState(false)

  useEffect(() => {
    let active = true
    async function load() {
      const lessonData = getLessonBySlug(slug)
      if (!lessonData) {
        if (active) setError('Lesson not found')
        return
      }
      const moduleData = await getLearningModuleByLessonSlug(slug)
      const session = await getSession()
      if (active) {
        setLesson(lessonData)
        setModule(moduleData)
        setState(initLessonPlayer(lessonData))
      }
      if (moduleData && session?.userId) {
        try {
          const progress = await startModuleProgress({
            moduleId: moduleData.id,
            lessonSlug: lessonData.slug,
            totalSteps: lessonData.blocks.length,
          })
          if (active) {
            setState(hydrateLessonPlayer(lessonData, progress))
          }
        } catch (e) {
          // ignore progress load errors
        } finally {
          if (active) setProgressLoaded(true)
        }
      } else {
        if (active) setProgressLoaded(true)
      }
    }
    load()
    return () => {
      active = false
    }
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

  const persistProgress = async (nextState) => {
    if (!module) return
    try {
      await saveModuleProgress({
        moduleId: module.id,
        lessonSlug: lesson.slug,
        currentStepIndex: nextState.activeIndex,
        totalSteps: lesson.blocks.length,
        answers: nextState.answers,
      })
    } catch (e) {
      // ignore
    }
  }

  const handleAnswer = (val) => {
    setState((prev) => {
      const next = setAnswer(prev, block.id, val)
      if (progressLoaded) persistProgress(next)
      return next
    })
  }

  const handleNext = () => {
    setState((prev) => {
      const validated = validateCurrentBlock(lesson, prev)
      const next = goNext(lesson, validated)
      if (progressLoaded) persistProgress(next)
      return next
    })
  }

  const handlePrev = () => {
    setState((prev) => {
      const next = goPrev(prev)
      if (progressLoaded) persistProgress(next)
      return next
    })
  }

  const handleSubmit = async () => {
    const result = submitLesson(lesson, state)
    setState(result.nextState)
    if (result.nextState.submitState === 'success' && module) {
      try {
        await submitModuleForUser({
          moduleId: module.id,
          lessonSlug: lesson.slug,
          answers: state.answers,
        })
        await completeModuleProgress(module.id)
      } catch (e) {
        // ignore
      }
    }
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
            Submit
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
