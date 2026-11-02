module.exports = ({ config }) => {
  return {
    ...config,
    plugins: [...(config.plugins || []), 'expo-notifications'],
    extra: {
      ...config.extra,
      nasaApiKey: process.env.EXPO_PUBLIC_NASA_API_KEY,
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      apiBase: process.env.EXPO_PUBLIC_API_BASE,
      sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
      launchAlertsEnabled: process.env.EXPO_PUBLIC_ENABLE_LAUNCH_ALERTS === 'true',
    },
  }
}
