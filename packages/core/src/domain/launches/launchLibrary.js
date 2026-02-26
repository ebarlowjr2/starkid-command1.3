const BASE_URL = 'https://ll.thespacedevs.com/2.2.0'

export async function getUpcomingLaunchesFromLibrary(limit = 10) {
  try {
    const url = new URL(`${BASE_URL}/launch/upcoming/`)
    url.searchParams.set('limit', String(limit))
    const response = await fetch(url.toString())
    if (!response.ok) throw new Error(`Launch Library error: ${response.status}`)
    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error('Error fetching launches from Launch Library:', error)
    return []
  }
}

export async function getLaunchSites() {
  try {
    const url = new URL(`${BASE_URL}/pad/`)
    url.searchParams.set('limit', '50')
    const response = await fetch(url.toString())
    if (!response.ok) throw new Error(`Launch Library error: ${response.status}`)
    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error('Error fetching launch sites:', error)
    return []
  }
}
