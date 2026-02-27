let adapter = {
  getItem: async (_key: string) => null,
  setItem: async (_key: string, _value: string) => {},
  removeItem: async (_key: string) => {},
  getAllKeys: async () => [] as string[],
}

export function configureStorage(nextAdapter: Partial<typeof adapter>) {
  adapter = { ...adapter, ...nextAdapter }
}

export async function getItem(key: string) {
  return adapter.getItem(key)
}

export async function setItem(key: string, value: string) {
  return adapter.setItem(key, value)
}

export async function removeItem(key: string) {
  return adapter.removeItem(key)
}

export async function getAllKeys() {
  return adapter.getAllKeys()
}
