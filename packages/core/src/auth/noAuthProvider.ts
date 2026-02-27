import type { AuthProvider } from './types.ts'

export const noAuthProvider: AuthProvider = {
  async getSession() {
    return null
  },
  async signIn() {
    return
  },
  async signOut() {
    return
  },
  onChange() {
    return () => {}
  }
}
