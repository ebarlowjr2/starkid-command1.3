function buildMission({ id, title, type, briefing, requiredData, difficulty = 'easy', timeLimit = 900, steps, expectedAnswer }) {
  return {
    id,
    title,
    difficulty,
    type,
    briefing,
    requiredData,
    timeLimit,
    grading: 'auto',
    steps,
    expectedAnswer,
  }
}

export function createMissionFromLaunch(launch) {
  if (!launch) return null
  const missionId = `launch:${launch.id || launch.name || 'unknown'}`
  return buildMission({
    id: missionId,
    title: `Launch Briefing: ${launch.name || 'Upcoming Launch'}`,
    type: 'math',
    briefing: 'Estimate launch window timing and payload orbit parameters.',
    requiredData: {
      launchId: launch.id || null,
      windowStart: launch.net || launch.window_start || null,
    },
    steps: [
      {
        id: 'ratio',
        prompt: 'Compute the ratio 4 ÷ 2 (enter the number).',
        inputType: 'number',
        unitLabel: null,
      },
    ],
    expectedAnswer: {
      type: 'number',
      value: 2,
      tolerance: 0.01,
    },
  })
}

export function createMissionFromEclipse(event) {
  if (!event) return null
  const missionId = `eclipse:${event.id || event.title || 'unknown'}`
  return buildMission({
    id: missionId,
    title: `Eclipse Mission: ${event.title || 'Sky Event'}`,
    type: 'science',
    briefing: 'Track the eclipse timing and visibility from your location.',
    requiredData: {
      eventId: event.id || null,
      start: event.start || null,
      end: event.end || null,
      visibility: event.visibility || null,
    },
    timeLimit: 1800,
    steps: [
      {
        id: 'confirm',
        prompt: 'Type the word ECLIPSE to confirm the briefing.',
        inputType: 'text',
      },
    ],
    expectedAnswer: {
      type: 'text',
      value: 'eclipse',
    },
  })
}

export function createMissionFromSolarEvent(activity) {
  if (!activity) return null
  const missionId = `solar:${activity.strongestClass || 'none'}`
  return buildMission({
    id: missionId,
    title: `Solar Alert: ${activity.strongestClass || 'Solar Activity'}`,
    type: 'cyber',
    briefing: 'Monitor solar activity and prepare comms shielding checklist.',
    requiredData: {
      strongestClass: activity.strongestClass || null,
      severityPct: activity.severityPct || 0,
    },
    timeLimit: 1200,
    steps: [
      {
        id: 'confirm',
        prompt: 'Select the correct severity class.',
        inputType: 'choice',
        choices: ['A', 'B', 'C', 'M', 'X'],
      },
    ],
    expectedAnswer: {
      type: 'choice',
      value: activity.strongestClass || 'A',
    },
  })
}
