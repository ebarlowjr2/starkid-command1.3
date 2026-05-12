import React, { useEffect, useState } from 'react'
import { listLearningModules, submitModuleForReview, publishModule, sendModuleBackToDraft, archiveModule, getSession } from '@starkid/core'
import { useNavigate } from 'react-router-dom'

export default function LearningModuleAdminReviewPage() {
  const nav = useNavigate()
  const [modules, setModules] = useState([])
  const [filter, setFilter] = useState('all')
  const [isAuthed, setIsAuthed] = useState(false)
  const [counts, setCounts] = useState({ draft: 0, in_review: 0, published: 0, archived: 0 })

  const loadModules = async () => {
    try {
      const data = await listLearningModules({ audience: 'admin' })
      setModules(data)
      const next = { draft: 0, in_review: 0, published: 0, archived: 0 }
      data.forEach((module) => {
        const key = module.status || 'draft'
        if (next[key] !== undefined) next[key] += 1
      })
      setCounts(next)
    } catch (error) {
      setModules([])
      setCounts({ draft: 0, in_review: 0, published: 0, archived: 0 })
    }
  }

  useEffect(() => {
    let active = true
    async function load() {
      const session = await getSession()
      if (active) setIsAuthed(Boolean(session))
      if (session) {
        loadModules()
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="p-6 max-w-3xl mx-auto text-cyan-100 font-mono">
      <button
        className="mb-4 text-xs text-cyan-300 border border-cyan-600/60 px-3 py-1 rounded"
        onClick={() => nav('/learning/admin')}
      >
        Back to Admin
      </button>
      <h1 className="text-2xl font-bold text-cyan-300">Module Review & Approval</h1>
      <p className="text-sm text-cyan-200/70 mt-2">
        Manage module status, publish, or archive drafts.
      </p>

      {!isAuthed ? (
        <div className="mt-6 border border-cyan-700/40 rounded-lg p-4 bg-black/40">
          <div className="text-sm text-cyan-200">Admin access requires a synced Command Profile.</div>
          <button
            className="mt-3 text-xs text-cyan-200 border border-cyan-600/70 px-3 py-2 rounded"
            onClick={() => nav('/profile')}
          >
            Sync Command Profile
          </button>
        </div>
      ) : (
      <div className="mt-6 border border-cyan-700/40 rounded-lg p-4 bg-black/40">
        <div className="text-xs text-cyan-300 mb-3">MODULE STATUS</div>
        <div className="text-xs text-cyan-300/80 mb-3">
          Draft: {counts.draft} • In Review: {counts.in_review} • Published: {counts.published} • Archived: {counts.archived}
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {['all', 'draft', 'in_review', 'published', 'archived'].map((item) => (
            <button
              key={item}
              className={`text-xs px-2 py-1 rounded border ${filter === item ? 'border-cyan-400 text-cyan-100' : 'border-cyan-700/50 text-cyan-300'}`}
              onClick={() => setFilter(item)}
            >
              {item === 'all' ? 'All' : item.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {modules
            .filter((module) => filter === 'all' || (module.status || 'draft') === filter)
            .map((module) => (
              <div key={module.id} className="flex flex-wrap items-center gap-2 border border-cyan-700/30 rounded-lg p-3">
                <div className="flex-1">
                  <div className="text-sm text-cyan-100">{module.title}</div>
                  <div className="text-xs text-cyan-300/70">{module.id}</div>
                </div>
                <span className="text-xs px-2 py-1 rounded border border-cyan-600/60 text-cyan-200">
                  {module.status || 'draft'}
                </span>
                <div className="flex flex-wrap gap-2">
                  {module.status === 'draft' ? (
                    <button
                      className="text-xs text-cyan-300 border border-cyan-600/60 px-2 py-1 rounded"
                      onClick={async () => {
                        await submitModuleForReview(module.id)
                        loadModules()
                      }}
                    >
                      Submit for Review
                    </button>
                  ) : null}
                  {module.status === 'in_review' ? (
                    <>
                      <button
                        className="text-xs text-cyan-300 border border-cyan-600/60 px-2 py-1 rounded"
                        onClick={async () => {
                          await publishModule(module.id)
                          loadModules()
                        }}
                      >
                        Publish
                      </button>
                      <button
                        className="text-xs text-cyan-300 border border-cyan-600/60 px-2 py-1 rounded"
                        onClick={async () => {
                          await sendModuleBackToDraft(module.id)
                          loadModules()
                        }}
                      >
                        Send Back to Draft
                      </button>
                    </>
                  ) : null}
                  {module.status !== 'archived' ? (
                    <button
                      className="text-xs text-cyan-300 border border-cyan-600/60 px-2 py-1 rounded"
                      onClick={async () => {
                        await archiveModule(module.id)
                        loadModules()
                      }}
                    >
                      Archive
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          {modules.length === 0 ? (
            <div className="text-xs text-cyan-300/70">No modules found.</div>
          ) : null}
        </div>
      </div>
      )}
    </div>
  )
}
