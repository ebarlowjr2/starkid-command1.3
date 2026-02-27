export const storageAdapter = {
  getItem: async (key) => {
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.error('Storage getItem error:', error)
      return null
    }
  },
  setItem: async (key, value) => {
    try {
      localStorage.setItem(key, value)
    } catch (error) {
      console.error('Storage setItem error:', error)
    }
  },
  removeItem: async (key) => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Storage removeItem error:', error)
    }
  },
  getAllKeys: async () => {
    try {
      return Object.keys(localStorage)
    } catch (error) {
      console.error('Storage getAllKeys error:', error)
      return []
    }
  }
}
