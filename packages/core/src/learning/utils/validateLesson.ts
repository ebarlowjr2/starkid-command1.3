import type { Lesson } from '../models/lesson'
import type { LessonBlock } from '../models/blocks'

export type LessonValidationResult = {
  valid: boolean
  errors: string[]
}

export function validateLessonBlocks(lesson: Lesson): LessonValidationResult {
  const errors: string[] = []
  if (!lesson.blocks || lesson.blocks.length === 0) {
    errors.push('Lesson has no blocks')
    return { valid: false, errors }
  }

  const ids = new Set<string>()
  lesson.blocks.forEach((block) => {
    if (ids.has(block.id)) {
      errors.push(`Duplicate block id: ${block.id}`)
    }
    ids.add(block.id)
    validateBlock(block, errors)
  })

  return { valid: errors.length === 0, errors }
}

function validateBlock(block: LessonBlock, errors: string[]) {
  switch (block.type) {
    case 'mission_brief':
      if (!block.heading || !block.body) errors.push(`mission_brief missing heading/body: ${block.id}`)
      break
    case 'concept':
      if (!block.body) errors.push(`concept missing body: ${block.id}`)
      break
    case 'instruction':
      if (!block.steps || block.steps.length === 0) errors.push(`instruction missing steps: ${block.id}`)
      break
    case 'worked_example':
      if (!block.problem || !block.solution) errors.push(`worked_example missing problem/solution: ${block.id}`)
      break
    case 'question_numeric':
      if (!block.prompt || !block.answer) errors.push(`question_numeric missing prompt/answer: ${block.id}`)
      break
    case 'question_short_text':
      if (!block.prompt) errors.push(`question_short_text missing prompt: ${block.id}`)
      break
    case 'question_multiple_choice':
      if (!block.prompt || !block.choices || block.choices.length === 0 || !block.answerId) {
        errors.push(`question_multiple_choice missing prompt/choices/answerId: ${block.id}`)
      }
      break
    case 'hint':
      if (!block.text) errors.push(`hint missing text: ${block.id}`)
      break
    case 'checkpoint':
      if (!block.prompt) errors.push(`checkpoint missing prompt: ${block.id}`)
      break
    case 'submission_prompt':
      if (!block.prompt || !block.instruction) errors.push(`submission_prompt missing fields: ${block.id}`)
      break
    case 'completion':
      if (!block.message) errors.push(`completion missing message: ${block.id}`)
      break
    default:
      errors.push(`Unknown block type: ${(block as LessonBlock).type}`)
  }
}
