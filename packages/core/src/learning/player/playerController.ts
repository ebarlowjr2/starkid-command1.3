import type { Lesson } from '../models/lesson'
import type { LessonSubmission } from '../models/submission'
import { createSubmission, saveDraftSubmission } from '../services/learningService'
import { createPlayerState, type LessonPlayerState } from './playerState'
import { validateBlockAnswer, validateLessonBeforeSubmit } from './playerValidation'

export function initLessonPlayer(lesson: Lesson) {
  return createPlayerState(lesson)
}

export function setAnswer(state: LessonPlayerState, blockId: string, answer: unknown) {
  return {
    ...state,
    answers: { ...state.answers, [blockId]: answer },
  }
}

export function validateCurrentBlock(lesson: Lesson, state: LessonPlayerState) {
  const block = lesson.blocks[state.activeIndex]
  const result = validateBlockAnswer(block, state.answers[block.id])
  return {
    ...state,
    validation: { ...state.validation, [block.id]: result },
  }
}

export function goNext(lesson: Lesson, state: LessonPlayerState) {
  const nextIndex = Math.min(state.activeIndex + 1, lesson.blocks.length - 1)
  return { ...state, activeIndex: nextIndex }
}

export function goPrev(state: LessonPlayerState) {
  const prevIndex = Math.max(state.activeIndex - 1, 0)
  return { ...state, activeIndex: prevIndex }
}

export function buildSubmissionPayload(lesson: Lesson, state: LessonPlayerState): LessonSubmission {
  return {
    submissionId: `submission_${lesson.id}_${state.startedAt}`,
    lessonId: lesson.id,
    userId: null,
    attemptId: `attempt_${lesson.id}_${state.startedAt}`,
    answers: state.answers,
    status: 'submitted',
    submittedAt: new Date().toISOString(),
    metadata: {
      lessonSlug: lesson.slug,
      totalBlocks: lesson.blocks.length,
    },
  }
}

export function submitLesson(lesson: Lesson, state: LessonPlayerState) {
  const validation = validateLessonBeforeSubmit(lesson, state.answers)
  if (!validation.valid) {
    return {
      nextState: {
        ...state,
        submitState: 'error',
        submitError: 'Please complete all required steps before submitting.',
      },
      submission: null,
      validation,
    }
  }

  const payload = buildSubmissionPayload(lesson, state)
  const submission = createSubmission(payload)
  return {
    nextState: { ...state, submitState: 'success', submitError: undefined },
    submission,
    validation,
  }
}

export function saveLessonDraft(lesson: Lesson, state: LessonPlayerState) {
  const payload: LessonSubmission = {
    submissionId: `draft_${lesson.id}_${state.startedAt}`,
    lessonId: lesson.id,
    userId: null,
    attemptId: `attempt_${lesson.id}_${state.startedAt}`,
    answers: state.answers,
    status: 'draft',
    submittedAt: undefined,
  }
  return saveDraftSubmission(payload)
}
