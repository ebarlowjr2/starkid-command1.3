import { getAlertsForUser, convertAlertToMission, filterByUserPreference } from '../../services/alertsService.ts'

export async function generateAlerts() {
  const result = await getAlertsForUser()
  return result.data || []
}

export { convertAlertToMission, filterByUserPreference }
