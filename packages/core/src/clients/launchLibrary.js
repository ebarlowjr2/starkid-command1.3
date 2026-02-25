import axios from 'axios'

const BASE_URL = 'https://ll.thespacedevs.com/2.2.0'

export async function getUpcomingLaunchesFromLibrary(limit = 10) {
  try {
    const response = await axios.get(`${BASE_URL}/launch/upcoming/`, {
      params: { limit }
    })
    return response.data.results || []
  } catch (error) {
    console.error('Error fetching launches from Launch Library:', error)
    return []
  }
}

export async function getLaunchSites() {
  try {
    const response = await axios.get(`${BASE_URL}/pad/`, {
      params: { limit: 50 }
    })
    return response.data.results || []
  } catch (error) {
    console.error('Error fetching launch sites:', error)
    return []
  }
}
