module.exports = ({ config }) => {
  return {
    ...config,
    extra: {
      ...config.extra,
      nasaApiKey: process.env.EXPO_PUBLIC_NASA_API_KEY,
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      apiBase: process.env.EXPO_PUBLIC_API_BASE,
    },
  }
}
