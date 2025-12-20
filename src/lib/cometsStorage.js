/**
 * Comet Storage Layer
 * Uses localStorage for web browsers
 * 
 * Note: localStorage works in both web browsers and Capacitor WebView,
 * so no special Capacitor handling is needed for basic storage.
 */

const STORAGE_KEY = 'starkid_saved_comets'

/**
 * Read saved comets from storage
 * @returns {Promise<Array>}
 */
export async function getSavedComets() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error reading saved comets:', error)
    return []
  }
}

/**
 * Save comets to storage
 * @param {Array} comets
 */
async function saveCometsList(comets) {
  try {
    const json = JSON.stringify(comets)
    localStorage.setItem(STORAGE_KEY, json)
  } catch (error) {
    console.error('Error saving comets:', error)
  }
}

/**
 * Check if a comet is saved
 * @param {string} designation
 * @returns {Promise<boolean>}
 */
export async function isSaved(designation) {
  const comets = await getSavedComets()
  return comets.some(c => c.designation === designation)
}

/**
 * Toggle saved state for a comet
 * @param {string} designation
 * @param {string} name
 * @returns {Promise<boolean>} - New saved state
 */
export async function toggleSavedComet(designation, name = '') {
  const comets = await getSavedComets()
  const existingIndex = comets.findIndex(c => c.designation === designation)
  
  if (existingIndex >= 0) {
    comets.splice(existingIndex, 1)
    await saveCometsList(comets)
    return false
  } else {
    comets.push({
      designation,
      name,
      notify: false,
      savedAt: new Date().toISOString()
    })
    await saveCometsList(comets)
    return true
  }
}

/**
 * Set notification preference for a saved comet
 * @param {string} designation
 * @param {boolean} notify
 */
export async function setNotify(designation, notify) {
  const comets = await getSavedComets()
  const comet = comets.find(c => c.designation === designation)
  
  if (comet) {
    comet.notify = notify
    await saveCometsList(comets)
  }
}

/**
 * Get a single saved comet by designation
 * @param {string} designation
 * @returns {Promise<SavedComet|null>}
 */
export async function getSavedComet(designation) {
  const comets = await getSavedComets()
  return comets.find(c => c.designation === designation) || null
}
