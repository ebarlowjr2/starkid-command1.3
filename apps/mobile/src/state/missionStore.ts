let currentMission: any = null

export function setMission(mission: any) {
  currentMission = mission
}

export function getMission() {
  return currentMission
}

export function clearMission() {
  currentMission = null
}
