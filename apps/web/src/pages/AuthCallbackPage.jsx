import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getSupabaseClient, getSession } from '@starkid/core'

export default function AuthCallbackPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [message, setMessage] = useState('Finalizing sign-in…')
  const [success, setSuccess] = useState(false)
  const [ready, setReady] = useState(false)

  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const redirect = params.get('redirect') || '/profile'
  const appDeepLink = 'starkidcommand://'

  useEffect(() => {
    let active = true
    async function finalize() {
      try {
        const supabase = getSupabaseClient()
        if (!supabase) {
          setMessage('Supabase not configured.')
          return
        }
        // Handles both "hash token" and "code" style redirects from Supabase.
        await supabase.auth.getSessionFromUrl({ storeSession: true })
        await getSession()
        if (!active) return
        setSuccess(true)
        setMessage('Email confirmed. Choose where to continue.')
      } catch (e) {
        if (!active) return
        setSuccess(false)
        setMessage('We could not finalize your session from this link. You can still continue on the web, or open the app if installed.')
      } finally {
        if (active) setReady(true)
      }
    }
    finalize()
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="p-6 max-w-xl mx-auto text-cyan-200">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-cyan-100">Identity Confirmation</h1>
        <p className="text-sm text-cyan-200/70 mt-2">
          {message}
        </p>
      </div>

      {success ? (
        <div className="mb-4 rounded border border-green-500/40 bg-green-900/20 px-3 py-2 text-sm text-green-200">
          ✅ Confirmation successful.
        </div>
      ) : (
        <div className="mb-4 rounded border border-yellow-500/30 bg-yellow-900/10 px-3 py-2 text-sm text-yellow-100">
          CHECK: If this page looks empty or stalled, use the buttons below to continue.
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-sm"
          disabled={!ready}
          onClick={() => {
            // Use client-side nav to avoid full reloads.
            navigate(redirect)
          }}
        >
          Continue on Web
        </button>

        <button
          className="px-4 py-2 rounded border border-cyan-700/60 text-cyan-200 hover:text-cyan-100 text-sm"
          onClick={() => {
            window.location.href = appDeepLink
          }}
        >
          Return to App
        </button>

        <button
          className="px-4 py-2 rounded border border-cyan-700/60 text-cyan-200 hover:text-cyan-100 text-sm"
          onClick={() => navigate('/')}
        >
          Home
        </button>
      </div>

      <div className="mt-5 text-xs text-cyan-200/60">
        Tip: If you don’t have the app installed on this device, use “Continue on Web”.
      </div>
    </div>
  )
}
