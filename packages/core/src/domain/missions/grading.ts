export function gradeAttempt(mission, answers) {
  if (!mission) return { pass: false, feedback: 'No mission provided.' }
  if (mission.grading === 'manual') {
    return { pass: false, feedback: 'Awaiting manual review.' }
  }

  const expected = mission.expectedAnswer
  if (!expected) {
    return { pass: true, feedback: 'No grading required.' }
  }

  const answer = answers?.main

  if (expected.type === 'number') {
    const expectedValue = Number(expected.value)
    const providedValue = Number(answer)
    if (!Number.isFinite(providedValue)) {
      return { pass: false, feedback: 'Provide a numeric answer.' }
    }
    const tolerance = expected.tolerance ?? 0
    const pass = Math.abs(providedValue - expectedValue) <= tolerance
    return { pass, feedback: pass ? 'Correct.' : 'Value out of range.' }
  }

  if (expected.type === 'choice') {
    const pass = answer === expected.value
    return { pass, feedback: pass ? 'Correct.' : 'Incorrect choice.' }
  }

  if (expected.type === 'text') {
    const pass = String(answer || '').trim().toLowerCase() === String(expected.value || '').trim().toLowerCase()
    return { pass, feedback: pass ? 'Correct.' : 'Answer does not match.' }
  }

  return { pass: false, feedback: 'Unsupported answer type.' }
}
