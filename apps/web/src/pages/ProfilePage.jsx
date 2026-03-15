import React, { useEffect, useState } from 'react'
import { getProfile, updateProfile, getCurrentActor, signOut, getSession } from '@starkid/core'
import SyncIdentityModal from '../components/auth/SyncIdentityModal.jsx'

export default function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ displayName: '', bio: '' })
  const [isGuest, setIsGuest] = useState(true)
  const [showSync, setShowSync] = useState(false)

  useEffect(() => {
    let active = true
    async function load() {
      await getSession()
      const data = await getProfile()
      const actor = await getCurrentActor()
      if (!active) return
      setProfile(data)
      setIsGuest(actor?.mode !== 'user')
      setForm({ displayName: data.displayName, bio: data.bio || '' })
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [])

  if (loading || !profile) {
    return <div className="p-6 text-cyan-200">Loading profile…</div>
  }

  const prefs = profile.alertPreferences
  const saved = profile.savedCounts
  const stats = profile.stats

  const toggle = async (key) => {
    const next = { ...prefs, [key]: !prefs[key] }
    const updated = await updateProfile({ alertPreferences: next })
    setProfile((prev) => ({ ...prev, alertPreferences: updated.alertPreferences || next }))
  }

  const saveProfile = async () => {
    const updated = await updateProfile({ displayName: form.displayName, bio: form.bio })
    setProfile((prev) => ({ ...prev, ...updated }))
  }

  return (
    <div className="p-6 max-w-5xl mx-auto text-white">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-wider text-cyan-300">COMMANDER PROFILE</h1>
        <p className="text-sm text-cyan-200/70">Local profile • Sync Command Profile to access across devices.</p>
      </div>

      <section className="border border-cyan-700/60 rounded-lg p-4 bg-black/60 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xl font-semibold text-white">
              {isGuest ? `Guest ${profile.rank}` : profile.displayName}
            </div>
            <div className="text-xs text-cyan-300">
              {isGuest ? 'Local Profile' : profile.rank} • Joined {new Date(profile.joinedAt).toLocaleDateString()}
            </div>
            <div className="text-sm text-cyan-200/70 mt-2">
              {profile.bio || (isGuest ? 'Guest profile' : '')}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-2 border border-cyan-500/60 rounded text-cyan-300 text-xs">
              RANK: {profile.rank.toUpperCase()}
            </div>
            {!isGuest ? (
              <button
                className="px-3 py-2 rounded border border-cyan-700/60 text-cyan-200 hover:text-cyan-100 text-xs"
                onClick={async () => {
                  await signOut()
                  const actor = await getCurrentActor()
                  setIsGuest(actor?.mode !== 'user')
                }}
              >
                Sign Out
              </button>
            ) : null}
          </div>
        </div>
        {isGuest ? (
          <div className="mt-4">
            <button
              className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white"
              onClick={() => setShowSync(true)}
            >
              Sync Command Profile
            </button>
          </div>
        ) : null}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Missions Completed', value: stats.missionsCompleted },
          { label: 'Activities Completed', value: stats.activitiesCompleted },
          { label: 'Saved Objects', value: saved.nearEarthObjects + saved.comets + saved.skyEvents },
          { label: 'Current STEM Level', value: stats.currentStemLevel || 'Cadet' },
        ].map((item) => (
          <div key={item.label} className="border border-cyan-700/60 rounded-lg p-4 bg-black/40">
            <div className="text-xs text-cyan-400">{item.label}</div>
            <div className="text-2xl text-white font-semibold mt-1">{item.value}</div>
          </div>
        ))}
      </section>

      <section className="border border-cyan-700/60 rounded-lg p-4 bg-black/60 mb-6">
        <div className="text-sm text-cyan-300 font-semibold mb-3">ALERT CONFIGURATION</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {[
            ['missionAlerts', 'Mission Alerts'],
            ['launches', 'Launches'],
            ['lunarEvents', 'Lunar Events'],
            ['asteroidFlybys', 'Asteroid Flybys'],
            ['spaceWeather', 'Space Weather'],
            ['stemRecommendations', 'STEM Recommendations'],
          ].map(([key, label]) => (
            <label
              key={key}
              className="flex items-center justify-between gap-3 px-3 py-2 rounded border border-cyan-800/50 bg-black/40"
            >
              <span className="text-cyan-200">{label}</span>
              <button
                type="button"
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  prefs[key] ? 'bg-cyan-500/80' : 'bg-zinc-700/70'
                }`}
                onClick={() => toggle(key)}
                aria-pressed={prefs[key]}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    prefs[key] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          ))}
        </div>
        {isGuest ? (
          <div className="mt-3 text-xs text-cyan-300/70">
            Preferences stored locally. Sync Command Profile to preserve them.
          </div>
        ) : null}
      </section>

      <section className="border border-cyan-700/60 rounded-lg p-4 bg-black/60 mb-6">
        <div className="text-sm text-cyan-300 font-semibold mb-3">SAVED OBJECTS</div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs text-cyan-200">
          <div>NEO: {saved.nearEarthObjects}</div>
          <div>Comets: {saved.comets}</div>
          <div>Sky Events: {saved.skyEvents}</div>
          <div>Missions: {saved.missions}</div>
          <div>Activities: {saved.activities}</div>
        </div>
      </section>

      <section className="border border-cyan-700/60 rounded-lg p-4 bg-black/60 mb-6">
        <div className="text-sm text-cyan-300 font-semibold mb-3">EDIT PROFILE</div>
        <div className="grid gap-3 max-w-xl">
          <input
            className="px-3 py-2 bg-black/50 border border-cyan-700/60 rounded text-cyan-100"
            value={form.displayName}
            onChange={(e) => setForm((prev) => ({ ...prev, displayName: e.target.value }))}
            placeholder="Display name"
          />
          <textarea
            className="px-3 py-2 bg-black/50 border border-cyan-700/60 rounded text-cyan-100"
            value={form.bio}
            onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
            placeholder="Short bio"
            rows={3}
          />
          <button className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white w-fit" onClick={saveProfile}>
            Save Profile
          </button>
          {isGuest ? (
            <div className="text-xs text-cyan-300/70 mt-2">
              Initialize Identity to sync this profile.
            </div>
          ) : null}
        </div>
      </section>
      <SyncIdentityModal
        open={showSync}
        onClose={() => setShowSync(false)}
        onSync={() => setShowSync(false)}
      />
    </div>
  )
}
