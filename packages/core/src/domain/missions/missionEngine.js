function buildMission({ title, type, briefing, requiredData, difficulty = 'easy', timeLimit = 900 }) {
  return {
    id: `${type}:${Date.now()}`,
    title,
    difficulty,
    type,
    briefing,
    requiredData,
    timeLimit,
  }
}

export function createMissionFromLaunch(launch) {
  if (!launch) return null
  return buildMission({
    title: `Launch Briefing: ${launch.name || 'Upcoming Launch'}`,
    type: 'math',
    briefing: 'Estimate launch window timing and payload orbit parameters.',
    requiredData: {
      launchId: launch.id || null,
      windowStart: launch.net || launch.window_start || null,
    },
  })
}

export function createMissionFromEclipse(event) {
  if (!event) return null
  return buildMission({
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
  })
}

export function createMissionFromSolarEvent(activity) {
  if (!activity) return null
  return buildMission({
    title: `Solar Alert: ${activity.strongestClass || 'Solar Activity'}`,
    type: 'cyber',
    briefing: 'Monitor solar activity and prepare comms shielding checklist.',
    requiredData: {
      strongestClass: activity.strongestClass || null,
      severityPct: activity.severityPct || 0,
    },
    timeLimit: 1200,
  })
}
