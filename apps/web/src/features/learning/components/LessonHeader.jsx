import React from 'react'

export default function LessonHeader({ lesson, activeIndex, totalBlocks }) {
  return (
    <div className="mb-4">
      <div className="text-xs font-mono text-cyan-300/70 mb-2">LESSON • {lesson.difficulty.toUpperCase()} • {lesson.estimatedMinutes} MIN</div>
      <h1 className="text-2xl md:text-3xl font-bold text-cyan-200">{lesson.title}</h1>
      <p className="text-sm text-cyan-200/70 mt-1">{lesson.subtitle}</p>
      <div className="mt-3 text-xs text-cyan-200/60 font-mono">STEP {activeIndex + 1} OF {totalBlocks}</div>
    </div>
  )
}
