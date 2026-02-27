export type Session = { userId: string }

export type AuthProvider = {
  getSession(): Promise<Session | null>
  signIn(): Promise<void>
  signOut(): Promise<void>
  onChange(cb: (session: Session | null) => void): () => void
}
