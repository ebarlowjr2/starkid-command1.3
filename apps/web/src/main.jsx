import React from 'react'
import { createRoot } from 'react-dom/client'
import '@google/model-viewer'
import { configureCore, configureStorage } from '@starkid/core'
import App from './App.jsx'
import './index.css'
import { storageAdapter } from './platform/storage.web.js'

configureCore({
  nasaApiKey: import.meta.env.VITE_NASA_API_KEY,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
})

configureStorage(storageAdapter)

createRoot(document.getElementById('root')).render(<App />)
