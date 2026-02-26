import { generateAlerts, filterByUserPreference } from './alerts.js'

export async function getAlertsForUser(pref) {
  const alerts = await generateAlerts()
  return pref ? filterByUserPreference(alerts, pref) : alerts
}
