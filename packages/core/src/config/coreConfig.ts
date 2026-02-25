export type CoreConfig = {
  nasaApiKey?: string
  supabaseUrl?: string
  supabaseAnonKey?: string
}

let config: CoreConfig = {}

export function configureCore(nextConfig: CoreConfig) {
  config = { ...config, ...nextConfig }
}

export function getCoreConfig(): CoreConfig {
  return config
}
