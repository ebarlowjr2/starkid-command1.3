import { describe, expect, test } from 'vitest'
import {
  listLessons,
  listLessonsByModuleType,
  getLessonBySlug,
  createSubmission,
  saveDraftSubmission,
  getSubmissionByAttemptId,
  launchFuelRatioLesson,
  validateLessonBlocks,
} from '../index.ts'

describe('learning foundation', () => {
  test('listLessons returns seed lesson', () => {
    const lessons = listLessons()
    expect(lessons.length).toBeGreaterThan(0)
  })

  test('getLessonBySlug returns launch fuel ratio lesson', () => {
    const lesson = getLessonBySlug('launch-fuel-ratio-calculation')
    expect(lesson?.id).toBe(launchFuelRatioLesson.id)
  })

  test('listLessonsByModuleType filters by module', () => {
    const lessons = listLessonsByModuleType('stem')
    expect(lessons.some((lesson) => lesson.slug === 'launch-fuel-ratio-calculation')).toBe(true)
  })

  test('createSubmission stores submission', () => {
    const submission = createSubmission({
      submissionId: 'sub-1',
      lessonId: launchFuelRatioLesson.id,
      userId: null,
      attemptId: 'attempt-1',
      answers: { block: 'value' },
      status: 'submitted',
    })
    expect(submission.submissionId).toBe('sub-1')
    const stored = getSubmissionByAttemptId('attempt-1')
    expect(stored?.submissionId).toBe('sub-1')
  })

  test('saveDraftSubmission stores draft', () => {
    const draft = saveDraftSubmission({
      submissionId: 'sub-2',
      lessonId: launchFuelRatioLesson.id,
      userId: null,
      attemptId: 'attempt-2',
      answers: {},
      status: 'draft',
    })
    expect(draft.status).toBe('draft')
    const stored = getSubmissionByAttemptId('attempt-2')
    expect(stored?.submissionId).toBe('sub-2')
  })

  test('seed lesson blocks validate', () => {
    const result = validateLessonBlocks(launchFuelRatioLesson)
    expect(result.valid).toBe(true)
  })
})
