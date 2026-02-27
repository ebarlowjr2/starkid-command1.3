import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getRepos } from '@starkid/core'
import { CURATED_COMETS, searchComets, getNotableComets } from '@starkid/core'

export default function CometsPage() {
  const [savedComets, setSavedComets] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSavedComets()
  }, [])

  useEffect(() => {
    if (searchQuery.trim()) {
      setSearchResults(searchComets(searchQuery))
    } else {
      setSearchResults(getNotableComets())
    }
  }, [searchQuery])

  async function loadSavedComets() {
    setLoading(true)
    const { savedItemsRepo, actor } = await getRepos()
    const saved = await savedItemsRepo.list(actor.actorId, 'comet')
    setSavedComets(saved)
    setLoading(false)
  }

  async function handleToggleSave(designation, name) {
    const { savedItemsRepo, actor } = await getRepos()
    const existing = savedComets.some((c) => c.id === designation)
    if (existing) {
      await savedItemsRepo.remove(actor.actorId, designation, 'comet')
    } else {
      await savedItemsRepo.save(actor.actorId, { id: designation, type: 'comet', designation, name })
    }
    await loadSavedComets()
  }

  function isCometSaved(designation) {
    return savedComets.some(c => c.id === designation || c.designation === designation)
  }

  function getCometDetails(designation) {
    return CURATED_COMETS.find(c => c.designation === designation)
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-cyan-300 tracking-wider mb-2">
          COMET TRACKER
        </h2>
        <p className="text-cyan-200/70 text-sm">
          Track comets across the solar system and check their visibility from your location
        </p>
      </div>

      {/* Saved Comets Section */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-6 bg-cyan-500 rounded"></div>
          <h3 className="text-lg font-semibold text-cyan-300">Saved Comets</h3>
          <span className="text-xs text-cyan-400 bg-cyan-900/50 px-2 py-0.5 rounded">
            {savedComets.length}
          </span>
        </div>

        {loading ? (
          <div className="border border-cyan-700 rounded-lg p-6 bg-zinc-900/50 animate-pulse">
            <div className="h-4 bg-cyan-900/30 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-cyan-900/20 rounded w-2/3"></div>
          </div>
        ) : savedComets.length === 0 ? (
          <div className="border border-cyan-700/50 rounded-lg p-6 bg-zinc-900/30 text-center">
            <p className="text-cyan-300/60 text-sm">No saved comets yet</p>
            <p className="text-cyan-400/40 text-xs mt-1">
              Search below and tap the star to save comets you want to track
            </p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {savedComets.map(saved => {
              const designation = saved.designation || saved.id
              const details = getCometDetails(designation)
              return (
                <Link
                  key={designation}
                  to={`/comets/${encodeURIComponent(designation)}`}
                  className="border border-cyan-600 rounded-lg p-4 bg-zinc-900/50 hover:bg-zinc-900/70 hover:border-cyan-500 transition-all group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-cyan-200 font-semibold group-hover:text-cyan-100">
                        {details?.name || saved.name || designation}
                      </h4>
                      <p className="text-cyan-400 text-xs">{designation}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        handleToggleSave(designation, saved.name)
                      }}
                      className="text-yellow-400 hover:text-yellow-300 transition-colors"
                      title="Remove from saved"
                    >
                      ★
                    </button>
                  </div>
                  {details && (
                    <p className="text-cyan-200/60 text-xs mt-2 line-clamp-2">
                      {details.description}
                    </p>
                  )}
                  <div className="text-cyan-500 text-xs mt-2 flex items-center gap-1">
                    View details →
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* Discover / Search Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-6 bg-cyan-500 rounded"></div>
          <h3 className="text-lg font-semibold text-cyan-300">Discover Comets</h3>
        </div>

        {/* Search Box */}
        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or designation (e.g., Halley, 12P, NEOWISE)..."
            className="w-full px-4 py-2 bg-black/50 border border-cyan-600 rounded-lg text-cyan-200 placeholder-cyan-500/50 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50"
          />
        </div>

        {/* Results */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {searchResults.map(comet => {
            const saved = isCometSaved(comet.designation)
            return (
              <div
                key={comet.designation}
                className="border border-cyan-700 rounded-lg p-4 bg-zinc-900/50 hover:bg-zinc-900/70 transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-cyan-200 font-semibold">{comet.name}</h4>
                    <p className="text-cyan-400 text-xs">{comet.designation}</p>
                  </div>
                  <button
                    onClick={() => handleToggleSave(comet.designation, comet.name)}
                    className={`text-lg transition-colors ${
                      saved 
                        ? 'text-yellow-400 hover:text-yellow-300' 
                        : 'text-cyan-600 hover:text-yellow-400'
                    }`}
                    title={saved ? 'Remove from saved' : 'Save comet'}
                  >
                    {saved ? '★' : '☆'}
                  </button>
                </div>
                
                <p className="text-cyan-200/60 text-xs mb-3 line-clamp-3">
                  {comet.description}
                </p>

                <div className="flex flex-wrap gap-2 text-xs mb-3">
                  <span className="bg-cyan-900/40 text-cyan-300 px-2 py-0.5 rounded">
                    Period: {comet.period}
                  </span>
                  {comet.notable && (
                    <span className="bg-yellow-900/40 text-yellow-300 px-2 py-0.5 rounded">
                      Notable
                    </span>
                  )}
                </div>

                <Link
                  to={`/comets/${encodeURIComponent(comet.designation)}`}
                  className="inline-block text-cyan-400 hover:text-cyan-300 text-xs transition-colors"
                >
                  View details & visibility →
                </Link>
              </div>
            )
          })}
        </div>

        {searchQuery && searchResults.length === 0 && (
          <div className="text-center py-8 text-cyan-300/60">
            <p>No comets found matching "{searchQuery}"</p>
            <p className="text-xs mt-1 text-cyan-400/40">
              Try searching by name (e.g., "Halley") or designation (e.g., "1P")
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
