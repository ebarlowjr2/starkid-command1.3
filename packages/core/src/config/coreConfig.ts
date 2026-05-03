export type CoreConfig = {
  nasaApiKey?: string
  supabaseUrl?: string
  supabaseAnonKey?: string
  // React Native needs an explicit storage adapter for Supabase auth session persistence.
  // Web can omit this and rely on default localStorage.
  supabaseAuthStorage?: {
    getItem: (key: string) => Promise<string | null> | string | null
    setItem: (key: string, value: string) => Promise<void> | void
    removeItem: (key: string) => Promise<void> | void
  }
  apiBase?: string
}

let config: CoreConfig = {}

export function configureCore(nextConfig: CoreConfig) {
  config = { ...config, ...nextConfig }
}

export function getCoreConfig(): CoreConfig {
  return config
}
