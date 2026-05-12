import React, { useEffect, useState } from 'react'
import { getSupabaseClient, getSession } from '@starkid/core'

export default function AuthCallbackPage() {
  const [message, setMessage] = useState('Initializing identity…')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    let active = true
    async function finalize() {
      try {
        const supabase = getSupabaseClient()
        if (!supabase) {
          setMessage('Supabase not configured.')
          return
        }
        await supabase.auth.getSessionFromUrl({ storeSession: true })
        await getSession()
        if (active) {
          setSuccess(true)
          setMessage('Identity initialized. Redirecting…')
          const params = new URLSearchParams(window.location.search)
          const redirect = params.get('redirect') || '/profile'
          setTimeout(() => {
            window.location.href = redirect
          }, 800)
        }
      } catch (e) {
        setMessage('Unable to initialize identity.')
      }
    }
    finalize()
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="p-6 text-cyan-200">
      <h1 className="text-xl font-semibold mb-2">Initialize Identity</h1>
      {success ? (
        <div className="mb-3 rounded border border-green-500/50 bg-green-900/30 px-3 py-2 text-sm text-green-200">
          ✅ Identity synced. Welcome aboard.
        </div>
      ) : null}
      <p className="text-sm text-cyan-200/70">{message}</p>
    </div>
  )
}
