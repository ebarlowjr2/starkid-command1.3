// src/pages/beyond/BeyondSolarSystemPage.jsx
// Beyond Our Solar System - Exoplanet discovery console

import React from 'react'
import { Link } from 'react-router-dom'
import useBeyondSolarSystem from './hooks/useBeyondSolarSystem.js'
import DiscoveryStats from '../../components/beyond/DiscoveryStats.jsx'
import HabitableCandidatesPanel from '../../components/beyond/HabitableCandidatesPanel.jsx'
import ExoplanetTable from '../../components/beyond/ExoplanetTable.jsx'
import DetectionMethodsInfo from '../../components/beyond/DetectionMethodsInfo.jsx'

export default function BeyondSolarSystemPage() {
  const {
    loading,
    error,
    stats,
    habitableCandidates,
    discoveryMethods,
    starTypes,
    detectionMethods,
    filteredPlanets,
    filters,
    updateFilters,
    clearFilters,
    page,
    setPage,
    refresh
  } = useBeyondSolarSystem()

  return (
    <div className="p-4 min-h-screen">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Link 
            to="/" 
            className="text-cyan-500 hover:text-cyan-400 text-sm font-mono"
          >
            ← COMMAND_CENTER
          </Link>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-wider text-purple-300 mb-2">
          BEYOND OUR SOLAR SYSTEM
        </h1>
        <p className="text-sm text-purple-200/70">
          Confirmed planets orbiting distant stars
        </p>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-red-400">!</span>
            <span className="text-red-300 font-mono text-sm">{error}</span>
          </div>
          <button
            onClick={refresh}
            className="mt-2 px-3 py-1 bg-red-900/50 text-red-300 rounded text-xs font-mono hover:bg-red-800/50"
          >
            RETRY
          </button>
        </div>
      )}

      <DiscoveryStats stats={stats} loading={loading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <HabitableCandidatesPanel 
            candidates={habitableCandidates} 
            loading={loading} 
          />
          <DetectionMethodsInfo methods={detectionMethods} />
        </div>
        <div>
          <ExoplanetTable
            paginatedData={filteredPlanets}
            filters={filters}
            updateFilters={updateFilters}
            clearFilters={clearFilters}
            discoveryMethods={discoveryMethods}
            starTypes={starTypes}
            page={page}
            setPage={setPage}
            loading={loading}
          />
        </div>
      </div>
    </div>
  )
}
