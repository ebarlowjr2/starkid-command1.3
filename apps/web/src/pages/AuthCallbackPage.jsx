import React, { useEffect, useState } from 'react'
import { getSupabaseClient, getSession } from '@starkid/core'

export default function AuthCallbackPage() {
  const [message, setMessage] = useState('Initializing identity…')

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
          setMessage('Identity initialized. Redirecting…')
          setTimeout(() => {
            window.location.href = '/profile'
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
      <p className="text-sm text-cyan-200/70">{message}</p>
    </div>
  )
}
