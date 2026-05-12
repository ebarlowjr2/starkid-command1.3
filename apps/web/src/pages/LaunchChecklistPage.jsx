import React, { useEffect, useMemo, useState } from 'react'
import {
  listLearningModules,
  getSession,
  getUserProgressForModule,
  getLearningModuleById,
} from '@starkid/core'

function Row({ title, status, detail, action }) {
  const color = status === 'pass' ? 'text-green-300' : status === 'warn' ? 'text-yellow-200' : 'text-red-300'
  const badge = status === 'pass' ? 'PASS' : status === 'warn' ? 'CHECK' : 'FAIL'
  return (
    <div className="border border-cyan-700/60 rounded-lg p-4 bg-black/50">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-cyan-100 font-semibold">{title}</div>
          {detail ? <div className="text-xs text-cyan-200/70 mt-1">{detail}</div> : null}
        </div>
        <div className={`text-xs px-2 py-1 rounded border border-cyan-500/30 bg-black/40 font-mono ${color}`}>{badge}</div>
      </div>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  )
}

export default function LaunchChecklistPage() {
  const [loading, setLoading] = useState(true)
  const [authed, setAuthed] = useState(false)
  const [modules, setModules] = useState([])
  const [error, setError] = useState(null)
  const [sampleProgress, setSampleProgress] = useState(null)

  useEffect(() => {
    let active = true
    async function run() {
      try {
        setLoading(true)
        const session = await getSession()
        const list = await listLearningModules({ moduleType: 'stem', audience: 'learner' })
        if (!active) return
        setAuthed(Boolean(session?.userId))
        setModules(list)

        // Try to load progress for the first published structured module.
        const firstStructured = list.find((m) => m?.sourceType === 'structured' && m?.status === 'published') || null
        if (session?.userId && firstStructured) {
          const prog = await getUserProgressForModule(firstStructured.id)
          if (active) setSampleProgress({ moduleId: firstStructured.id, progress: prog })
        }
        setError(null)
      } catch (e) {
        if (!active) return
        setError(e?.message || 'Checklist failed to run')
      } finally {
        if (active) setLoading(false)
      }
    }
    run()
    return () => {
      active = false
    }
  }, [])

  const hasPublished = modules.some((m) => m?.status === 'published')
  const hasNonPublishedInLearnerList = modules.some((m) => m?.status && m.status !== 'published')

  const links = useMemo(
    () => [
      { label: 'About', href: '/about' },
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
    []
  )

  return (
    <div className="p-6 max-w-4xl mx-auto text-cyan-100">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-wider text-cyan-300">Launch Checklist (Internal)</h1>
        <p className="text-sm text-cyan-200/70 mt-2">
          This page is for internal QA. It runs lightweight checks and provides quick links for manual verification.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {links.map((l) => (
            <a
              key={l.href}
              className="text-xs text-cyan-300 border border-cyan-600/60 px-3 py-1 rounded hover:text-cyan-200"
              href={l.href}
              target="_blank"
              rel="noreferrer"
            >
              Open {l.label}
            </a>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-cyan-200/70 font-mono">Running checks…</div>
      ) : error ? (
        <div className="text-red-300 font-mono">{error}</div>
      ) : (
        <div className="grid gap-4">
          <Row
            title="Legal Pages Reachable"
            status="warn"
            detail="Use the Open buttons above to confirm About / Privacy / Terms render correctly."
          />

          <Row
            title="Published Modules Visible"
            status={hasPublished ? 'pass' : 'fail'}
            detail={hasPublished ? `Learner module count: ${modules.length}` : 'No published learning modules returned for learner audience.'}
            action={
              <a className="text-xs text-cyan-300 underline" href="/learning/stem" target="_blank" rel="noreferrer">
                Open STEM Activities
              </a>
            }
          />

          <Row
            title="Draft Modules Hidden From Learners"
            status={!hasNonPublishedInLearnerList ? 'pass' : 'fail'}
            detail={!hasNonPublishedInLearnerList ? 'Learner list contains only published modules.' : 'Learner list included non-published modules (draft/in_review/archived).'}
          />

          <Row
            title="Mission Start Requires Auth"
            status="warn"
            detail="Manual: open a module as signed out and confirm Start Mission prompts Initialize Identity."
          />

          <Row
            title="Progress Resumes (Authed)"
            status={authed ? 'warn' : 'warn'}
            detail={
              !authed
                ? 'Not signed in. Sign in and re-check to validate resume.'
                : sampleProgress?.progress
                ? `Sample module progress status: ${sampleProgress.progress.status}, step ${sampleProgress.progress.currentStepIndex + 1}`
                : 'No saved progress found yet (complete or start a module, then re-check).'
            }
          />

          <Row
            title="XP Awarded Once"
            status="warn"
            detail="Manual: complete a module twice and confirm total XP only increases once."
          />
        </div>
      )}

      <div className="mt-8 text-xs text-cyan-200/60">
        Tip: If you need to verify admin governance, use the admin hub at{' '}
        <a className="underline" href="/learning/admin" target="_blank" rel="noreferrer">/learning/admin</a>.
      </div>
    </div>
  )
}

