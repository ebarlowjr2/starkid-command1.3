import { createClient } from 'npm:@supabase/supabase-js@2.97.0'
import { runLaunchAlertWorker } from '../_shared/launchAlertsWorker.ts'

Deno.serve(async (request) => {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  const secret = Deno.env.get('LAUNCH_ALERT_CRON_SECRET')
  if (!secret || request.headers.get('Authorization') !== `Bearer ${secret}`) return new Response('Unauthorized', { status: 401 })
  if (Deno.env.get('LAUNCH_ALERT_DELIVERY_ENABLED') !== 'true') return Response.json({ skipped: 'delivery_disabled' })
  try {
    const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } })
    const result = await runLaunchAlertWorker({ db, expoToken: Deno.env.get('EXPO_ACCESS_TOKEN') || '',
      sourceToken: Deno.env.get('LAUNCH_LIBRARY_TOKEN'), pollSeconds: Number(Deno.env.get('LAUNCH_ALERT_POLL_SECONDS') || 300) })
    return Response.json(result)
  } catch (error) {
    // Never log tokens or launch subscriptions.
    console.error('Launch alert run failed', error instanceof Error ? error.message : 'unknown error')
    return Response.json({ error: 'Launch alert run failed. Check server diagnostics.' }, { status: 503 })
  }
})
