export type LessonBlockType =
  | 'mission_brief'
  | 'concept'
  | 'instruction'
  | 'worked_example'
  | 'question_numeric'
  | 'question_short_text'
  | 'question_multiple_choice'
  | 'hint'
  | 'checkpoint'
  | 'submission_prompt'
  | 'completion'

export type LessonBlockBase = {
  id: string
  type: LessonBlockType
  order: number
  title?: string
  subtitle?: string
}

export type MissionBriefBlock = LessonBlockBase & {
  type: 'mission_brief'
  heading: string
  body: string
  context?: string
  stats?: string[]
}

export type ConceptBlock = LessonBlockBase & {
  type: 'concept'
  body: string
  bullets?: string[]
}

export type InstructionBlock = LessonBlockBase & {
  type: 'instruction'
  steps: string[]
  workedExample?: {
    problem: string
    solution: string
    steps?: string[]
  }
}

export type WorkedExampleBlock = LessonBlockBase & {
  type: 'worked_example'
  problem: string
  solution: string
  steps?: string[]
}

export type QuestionNumericBlock = LessonBlockBase & {
  type: 'question_numeric'
  prompt: string
  unit?: string
  hint?: string
  answer: {
    value: number
    tolerance: number
  }
  inputLabel?: string
  explanation?: string
}

export type QuestionShortTextBlock = LessonBlockBase & {
  type: 'question_short_text'
  prompt: string
  answer?: {
    accepted: string[]
  }
  inputLabel?: string
  exampleAnswer?: string
}

export type QuestionMultipleChoiceBlock = LessonBlockBase & {
  type: 'question_multiple_choice'
  prompt: string
  choices: { id: string; text: string }[]
  answerId: string
  allowMultiple?: boolean
}

export type HintBlock = LessonBlockBase & {
  type: 'hint'
  text: string
}

export type CheckpointBlock = LessonBlockBase & {
  type: 'checkpoint'
  prompt: string
  criteria?: string[]
}

export type SubmissionPromptBlock = LessonBlockBase & {
  type: 'submission_prompt'
  prompt: string
  instruction: string
}

export type CompletionBlock = LessonBlockBase & {
  type: 'completion'
  message: string
  nextSteps?: string[]
}

export type LessonBlock =
  | MissionBriefBlock
  | ConceptBlock
  | InstructionBlock
  | WorkedExampleBlock
  | QuestionNumericBlock
  | QuestionShortTextBlock
  | QuestionMultipleChoiceBlock
  | HintBlock
  | CheckpointBlock
  | SubmissionPromptBlock
  | CompletionBlock
