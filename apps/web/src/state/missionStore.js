let currentMission = null

export function setMission(mission) {
  currentMission = mission
}

export function getMission() {
  return currentMission
}

export function clearMission() {
  currentMission = null
}
