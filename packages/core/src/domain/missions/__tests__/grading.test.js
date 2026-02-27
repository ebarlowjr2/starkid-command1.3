import { describe, it, expect } from 'vitest'
import { gradeAttempt } from '../grading.ts'

describe('gradeAttempt', () => {
  it('grades exact numeric match', () => {
    const mission = { grading: 'auto', expectedAnswer: { type: 'number', value: 5 } }
    const result = gradeAttempt(mission, { main: 5 })
    expect(result.pass).toBe(true)
  })

  it('grades within tolerance', () => {
    const mission = { grading: 'auto', expectedAnswer: { type: 'number', value: 10, tolerance: 0.5 } }
    const result = gradeAttempt(mission, { main: 10.3 })
    expect(result.pass).toBe(true)
  })

  it('fails outside tolerance', () => {
    const mission = { grading: 'auto', expectedAnswer: { type: 'number', value: 10, tolerance: 0.5 } }
    const result = gradeAttempt(mission, { main: 11 })
    expect(result.pass).toBe(false)
  })
})
