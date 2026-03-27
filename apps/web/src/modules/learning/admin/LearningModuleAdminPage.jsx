import React, { useState } from 'react'
import { createLearningModule } from '@starkid/core'

const MODULE_TYPES = [
  { value: 'stem', label: 'STEM Activities' },
  { value: 'cyberlab', label: 'Cyber Lab' },
  { value: 'ai', label: 'AI Systems' },
  { value: 'linux', label: 'Linux Systems' },
]

const TRACKS = ['math', 'science', 'cyber', 'linux', 'ai']
const LEVELS = ['cadet', 'explorer', 'specialist', 'operator']

export default function LearningModuleAdminPage() {
  const [status, setStatus] = useState('')
  const [form, setForm] = useState({
    id: '',
    title: '',
    description: '',
    tagline: '',
    trainingType: 'Math',
    moduleType: 'stem',
    track: 'math',
    level: 'cadet',
    estimatedMinutes: 5,
    blockCount: 0,
    blockList: '',
    missionContext: '',
    objective: '',
    missionOutcomes: '',
    lessonSlug: '',
    tags: '',
    answerKey: '',
  })

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('Submitting...')
    try {
      const payload = {
        id: form.id || undefined,
        moduleType: form.moduleType,
        title: form.title,
        description: form.description,
        tagline: form.tagline,
        trainingType: form.trainingType,
        track: form.track,
        level: form.level,
        estimatedMinutes: Number(form.estimatedMinutes) || undefined,
        blockCount: Number(form.blockCount) || undefined,
        blockList: form.blockList
          ? form.blockList.split(',').map((item) => item.trim()).filter(Boolean)
          : undefined,
        missionContext: form.missionContext,
        objective: form.objective,
        missionOutcomes: form.missionOutcomes
          ? form.missionOutcomes.split('\n').map((item) => item.trim()).filter(Boolean)
          : undefined,
        lessonSlug: form.lessonSlug || undefined,
        tags: form.tags ? form.tags.split(',').map((item) => item.trim()).filter(Boolean) : undefined,
        answerKey: form.answerKey || undefined,
        steps: [],
        grading: 'auto',
      }

      await createLearningModule(payload)
      setStatus('Module created and stored in Supabase.')
      setForm((prev) => ({ ...prev, title: '', description: '', tagline: '', lessonSlug: '', missionContext: '', objective: '', missionOutcomes: '', tags: '', answerKey: '' }))
    } catch (error) {
      setStatus(error?.message || 'Failed to create module.')
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto text-cyan-100 font-mono">
      <h1 className="text-2xl font-bold text-cyan-300">Learning Module Admin</h1>
      <p className="text-sm text-cyan-200/70 mt-2">
        Add learning modules to Supabase. These will appear in web and mobile automatically.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <label className="text-xs">
            Module ID (optional)
            <input className="w-full mt-1 bg-black/60 border border-cyan-600/60 p-2 rounded" value={form.id} onChange={update('id')} />
          </label>
          <label className="text-xs">
            Title
            <input required className="w-full mt-1 bg-black/60 border border-cyan-600/60 p-2 rounded" value={form.title} onChange={update('title')} />
          </label>
          <label className="text-xs">
            Tagline
            <input className="w-full mt-1 bg-black/60 border border-cyan-600/60 p-2 rounded" value={form.tagline} onChange={update('tagline')} />
          </label>
          <label className="text-xs">
            Training Type
            <input className="w-full mt-1 bg-black/60 border border-cyan-600/60 p-2 rounded" value={form.trainingType} onChange={update('trainingType')} />
          </label>
          <label className="text-xs">
            Module Type
            <select className="w-full mt-1 bg-black/60 border border-cyan-600/60 p-2 rounded" value={form.moduleType} onChange={update('moduleType')}>
              {MODULE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </label>
          <label className="text-xs">
            Track
            <select className="w-full mt-1 bg-black/60 border border-cyan-600/60 p-2 rounded" value={form.track} onChange={update('track')}>
              {TRACKS.map((track) => (
                <option key={track} value={track}>{track}</option>
              ))}
            </select>
          </label>
          <label className="text-xs">
            Level
            <select className="w-full mt-1 bg-black/60 border border-cyan-600/60 p-2 rounded" value={form.level} onChange={update('level')}>
              {LEVELS.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </label>
          <label className="text-xs">
            Estimated Minutes
            <input type="number" className="w-full mt-1 bg-black/60 border border-cyan-600/60 p-2 rounded" value={form.estimatedMinutes} onChange={update('estimatedMinutes')} />
          </label>
          <label className="text-xs">
            Block Count
            <input type="number" className="w-full mt-1 bg-black/60 border border-cyan-600/60 p-2 rounded" value={form.blockCount} onChange={update('blockCount')} />
          </label>
          <label className="text-xs">
            Lesson Slug (optional)
            <input className="w-full mt-1 bg-black/60 border border-cyan-600/60 p-2 rounded" value={form.lessonSlug} onChange={update('lessonSlug')} />
          </label>
        </div>

        <label className="text-xs block">
          Description
          <textarea className="w-full mt-1 bg-black/60 border border-cyan-600/60 p-2 rounded" rows={3} value={form.description} onChange={update('description')} />
        </label>

        <label className="text-xs block">
          Mission Context
          <textarea className="w-full mt-1 bg-black/60 border border-cyan-600/60 p-2 rounded" rows={3} value={form.missionContext} onChange={update('missionContext')} />
        </label>

        <label className="text-xs block">
          Objective
          <textarea className="w-full mt-1 bg-black/60 border border-cyan-600/60 p-2 rounded" rows={2} value={form.objective} onChange={update('objective')} />
        </label>

        <label className="text-xs block">
          Mission Outcomes (one per line)
          <textarea className="w-full mt-1 bg-black/60 border border-cyan-600/60 p-2 rounded" rows={4} value={form.missionOutcomes} onChange={update('missionOutcomes')} />
        </label>

        <label className="text-xs block">
          Block List (comma-separated)
          <input className="w-full mt-1 bg-black/60 border border-cyan-600/60 p-2 rounded" value={form.blockList} onChange={update('blockList')} />
        </label>

        <label className="text-xs block">
          Tags (comma-separated)
          <input className="w-full mt-1 bg-black/60 border border-cyan-600/60 p-2 rounded" value={form.tags} onChange={update('tags')} />
        </label>

        <label className="text-xs block">
          Answer Key (optional)
          <textarea className="w-full mt-1 bg-black/60 border border-cyan-600/60 p-2 rounded" rows={2} value={form.answerKey} onChange={update('answerKey')} />
        </label>

        <button className="mt-4 text-xs text-cyan-200 border border-cyan-600/70 px-4 py-2 rounded">
          Submit Module
        </button>
        {status ? <div className="text-xs text-cyan-200/80 mt-2">{status}</div> : null}
      </form>
    </div>
  )
}
