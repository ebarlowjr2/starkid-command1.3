import React from 'react'
import { createRoot } from 'react-dom/client'
import '@google/model-viewer'
import * as Sentry from '@sentry/react'
import { configureCore, configureStorage } from '@starkid/core'
import App from './App.jsx'
import './index.css'
import { storageAdapter } from './platform/storage.web.js'

const sentryDsn = import.meta.env.VITE_SENTRY_DSN
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    // Keep PII disabled by default for launch; opt-in via env var if needed.
    sendDefaultPii: import.meta.env.VITE_SENTRY_SEND_PII === 'true',
    tracesSampleRate: import.meta.env.DEV ? 1.0 : 0.2,
    environment: import.meta.env.MODE,
  })
}

configureCore({
  nasaApiKey: import.meta.env.VITE_NASA_API_KEY,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  apiBase: '/api',
})

configureStorage(storageAdapter)

createRoot(document.getElementById('root')).render(<App />)
