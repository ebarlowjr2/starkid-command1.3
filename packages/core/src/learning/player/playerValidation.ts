import type { Lesson } from '../models/lesson'
import type { LessonBlock } from '../models/blocks'

export type ValidationResult = { valid: boolean; message?: string }

function validateQuizQuestion(q: any, a: unknown): ValidationResult {
  switch (q.type) {
    case 'numeric':
      if (a === null || a === undefined || a === '') return { valid: false, message: 'Enter a numeric value.' }
      if (Number.isNaN(Number(a))) return { valid: false, message: 'Enter a valid number.' }
      return { valid: true }
    case 'short_text':
      if (!a || String(a).trim().length === 0) return { valid: false, message: 'Enter a response.' }
      return { valid: true }
    case 'multiple_choice':
    case 'true_false':
      if (!a) return { valid: false, message: 'Select an option.' }
      return { valid: true }
    default:
      return { valid: true }
  }
}

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
      if (block.checkpointQuiz?.questions?.length) {
        const obj = (answer && typeof answer === 'object') ? (answer as Record<string, unknown>) : {}
        for (const q of block.checkpointQuiz.questions) {
          const res = validateQuizQuestion(q, obj[q.id])
          if (!res.valid) return { valid: false, message: `Complete the final checkpoint.` }
        }
      }
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
      block.type === 'checkpoint' ||
      block.type === 'submission_prompt'
    ) {
      const result = validateBlockAnswer(block, answers[block.id])
      if (!result.valid) {
        failures.push(`${block.id}:${result.message || 'Missing answer'}`)
      }
    }
  })
  return { valid: failures.length === 0, failures }
}
