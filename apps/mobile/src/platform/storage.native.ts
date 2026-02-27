import AsyncStorage from '@react-native-async-storage/async-storage'

export const storageAdapter = {
  getItem: AsyncStorage.getItem,
  setItem: AsyncStorage.setItem,
  removeItem: AsyncStorage.removeItem,
  getAllKeys: AsyncStorage.getAllKeys,
}
