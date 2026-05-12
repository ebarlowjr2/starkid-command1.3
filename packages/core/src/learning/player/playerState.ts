import type { Lesson } from '../models/lesson'
import type { LessonBlock } from '../models/blocks'

export type LessonPlayerState = {
  lessonId: string
  lessonSlug: string
  startedAt: string
  activeIndex: number
  totalBlocks: number
  answers: Record<string, unknown>
  validation: Record<string, { valid: boolean; message?: string }>
  submitState: 'idle' | 'submitting' | 'success' | 'error'
  submitError?: string
}

export function createPlayerState(lesson: Lesson): LessonPlayerState {
  return {
    lessonId: lesson.id,
    lessonSlug: lesson.slug,
    startedAt: new Date().toISOString(),
    activeIndex: 0,
    totalBlocks: lesson.blocks.length,
    answers: {},
    validation: {},
    submitState: 'idle',
  }
}

export function getActiveBlock(lesson: Lesson, state: LessonPlayerState): LessonBlock {
  return lesson.blocks[state.activeIndex]
}
