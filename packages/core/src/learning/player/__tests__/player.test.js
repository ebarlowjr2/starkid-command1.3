import { describe, expect, test } from 'vitest'
import { launchFuelRatioLesson } from '../../seeds/launchFuelRatioLesson'
import {
  initLessonPlayer,
  setAnswer,
  goNext,
  goPrev,
  validateCurrentBlock,
  buildSubmissionPayload,
  submitLesson,
} from '../playerController'


describe('learning player', () => {
  test('initializes player state', () => {
    const state = initLessonPlayer(launchFuelRatioLesson)
    expect(state.lessonId).toBe(launchFuelRatioLesson.id)
    expect(state.activeIndex).toBe(0)
  })

  test('progression next and prev', () => {
    const state = initLessonPlayer(launchFuelRatioLesson)
    const next = goNext(launchFuelRatioLesson, state)
    expect(next.activeIndex).toBe(1)
    const prev = goPrev(next)
    expect(prev.activeIndex).toBe(0)
  })

  test('answer storage by block id', () => {
    const state = initLessonPlayer(launchFuelRatioLesson)
    const blockId = launchFuelRatioLesson.blocks[4].id
    const updated = setAnswer(state, blockId, 1234)
    expect(updated.answers[blockId]).toBe(1234)
  })

  test('validation flags missing numeric value', () => {
    const state = initLessonPlayer(launchFuelRatioLesson)
    const numericBlockIndex = launchFuelRatioLesson.blocks.findIndex((b) => b.type === 'question_numeric')
    const withIndex = { ...state, activeIndex: numericBlockIndex }
    const validated = validateCurrentBlock(launchFuelRatioLesson, withIndex)
    const blockId = launchFuelRatioLesson.blocks[numericBlockIndex].id
    expect(validated.validation[blockId].valid).toBe(false)
  })

  test('build submission payload', () => {
    const state = initLessonPlayer(launchFuelRatioLesson)
    const payload = buildSubmissionPayload(launchFuelRatioLesson, state)
    expect(payload.lessonId).toBe(launchFuelRatioLesson.id)
  })

  test('submit fails when required answers missing', () => {
    const state = initLessonPlayer(launchFuelRatioLesson)
    const result = submitLesson(launchFuelRatioLesson, state)
    expect(result.nextState.submitState).toBe('error')
  })
})
