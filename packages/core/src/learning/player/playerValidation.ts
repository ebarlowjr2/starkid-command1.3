import type { Lesson } from '../models/lesson'
import type { LessonBlock } from '../models/blocks'

export type ValidationResult = { valid: boolean; message?: string }

export function validateBlockAnswer(block: LessonBlock, answer: unknown): ValidationResult {
  switch (block.type) {
    case 'question_numeric':
      if (answer === null || answer === undefined || answer === '') {
        return { valid: false, message: 'Enter a numeric value.' }
      }
      if (Number.isNaN(Number(answer))) {
        return { valid: false, message: 'Enter a valid number.' }
      }
      return { valid: true }
    case 'question_short_text':
      if (!answer || String(answer).trim().length === 0) {
        return { valid: false, message: 'Enter a response.' }
      }
      return { valid: true }
    case 'question_multiple_choice':
      if (!answer) {
        return { valid: false, message: 'Select an option.' }
      }
      return { valid: true }
    case 'checkpoint':
      if (!answer) {
        return { valid: false, message: 'Acknowledge the checkpoint.' }
      }
      return { valid: true }
    case 'submission_prompt':
      return { valid: true }
    default:
      return { valid: true }
  }
}

export function validateLessonBeforeSubmit(lesson: Lesson, answers: Record<string, unknown>) {
  const failures: string[] = []
  lesson.blocks.forEach((block) => {
    if (
      block.type === 'question_numeric' ||
      block.type === 'question_short_text' ||
      block.type === 'question_multiple_choice' ||
      block.type === 'checkpoint'
    ) {
      const result = validateBlockAnswer(block, answers[block.id])
      if (!result.valid) {
        failures.push(`${block.id}:${result.message || 'Missing answer'}`)
      }
    }
  })
  return { valid: failures.length === 0, failures }
}
