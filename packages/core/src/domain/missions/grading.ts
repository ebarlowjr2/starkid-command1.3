export function gradeAttempt(mission, answers) {
  if (!mission) return { pass: false, feedback: '❌ Not quite. Hint: Start by opening a mission first.' }
  if (mission.grading === 'manual') {
    return { pass: false, feedback: '❌ Not quite. Hint: This mission requires manual review.' }
  }

  const expected = mission.expectedAnswer
  if (!expected) {
    return { pass: true, feedback: '✅ Correct. Great job.' }
  }

  const answer = answers?.main

  if (expected.type === 'number') {
    const expectedValue = Number(expected.value)
    const providedValue = Number(answer)
    if (!Number.isFinite(providedValue)) {
      return { pass: false, feedback: '❌ Not quite. Hint: Enter a numeric value.' }
    }
    const tolerance = expected.tolerance ?? 0
    const pass = Math.abs(providedValue - expectedValue) <= tolerance
    return {
      pass,
      feedback: pass ? '✅ Correct. Great job.' : '❌ Not quite. Hint: Check your arithmetic and units.',
    }
  }

  if (expected.type === 'choice') {
    const pass = String(answer) === String(expected.value)
    return {
      pass,
      feedback: pass ? '✅ Correct. Great job.' : '❌ Not quite. Hint: Re-read the briefing for the correct option.',
    }
  }

  if (expected.type === 'text') {
    const pass = String(answer || '').trim().toLowerCase() === String(expected.value || '').trim().toLowerCase()
    return {
      pass,
      feedback: pass ? '✅ Correct. Great job.' : '❌ Not quite. Hint: Match the exact text response.',
    }
  }

  return { pass: false, feedback: '❌ Not quite. Hint: Unsupported answer type.' }
}
