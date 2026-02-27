// src/components/beyond/ExoplanetTable.jsx
// Paginated exoplanet explorer table with filters

import React from 'react'

export default function ExoplanetTable({
  paginatedData,
  filters,
  updateFilters,
  clearFilters,
  discoveryMethods,
  starTypes,
  page,
  setPage,
  loading
}) {
  if (loading) {
    return (
      <div className="bg-gray-900/80 border border-cyan-800/50 rounded-lg p-4 mb-6">
        <div className="h-4 bg-cyan-900/50 rounded w-1/4 mb-4 animate-pulse"></div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-12 bg-cyan-900/30 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  const { data, total, totalPages } = paginatedData

  return (
    <div className="bg-gray-900/80 border border-cyan-800/50 rounded-lg p-4 mb-6 shadow-lg shadow-cyan-500/10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-mono text-cyan-400 tracking-wider">
          EXOPLANET_EXPLORER
        </h2>
        <span className="text-xs text-cyan-500/70 font-mono">
          {total.toLocaleString()} RESULTS
        </span>
      </div>

      <div className="flex flex-wrap gap-3 mb-4 p-3 bg-black/30 rounded border border-cyan-900/30">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400 font-mono">MAX_DISTANCE:</label>
          <select
            value={filters.maxDistance || ''}
            onChange={(e) => updateFilters({ maxDistance: e.target.value ? Number(e.target.value) : null })}
            className="bg-gray-800 border border-cyan-800/50 rounded px-2 py-1 text-xs text-cyan-300 font-mono"
          >
            <option value="">All</option>
            <option value="50">50 ly</option>
            <option value="100">100 ly</option>
            <option value="500">500 ly</option>
            <option value="1000">1000 ly</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400 font-mono">DISCOVERY:</label>
          <select
            value={filters.discoveryMethod || ''}
            onChange={(e) => updateFilters({ discoveryMethod: e.target.value || null })}
            className="bg-gray-800 border border-cyan-800/50 rounded px-2 py-1 text-xs text-cyan-300 font-mono"
          >
            <option value="">All</option>
            {discoveryMethods.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400 font-mono">STAR_TYPE:</label>
          <select
            value={filters.starType || ''}
            onChange={(e) => updateFilters({ starType: e.target.value || null })}
            className="bg-gray-800 border border-cyan-800/50 rounded px-2 py-1 text-xs text-cyan-300 font-mono"
          >
            <option value="">All</option>
            {starTypes.map(type => (
              <option key={type} value={type}>{type.split(' ')[0]}</option>
            ))}
          </select>
        </div>

        {(filters.maxDistance || filters.discoveryMethod || filters.starType) && (
          <button
            onClick={clearFilters}
            className="text-xs text-red-400 hover:text-red-300 font-mono underline"
          >
            CLEAR_FILTERS
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-cyan-800/50">
              <th className="text-left py-2 px-2 text-xs text-cyan-500 font-mono">PLANET</th>
              <th className="text-left py-2 px-2 text-xs text-cyan-500 font-mono">DISTANCE</th>
              <th className="text-left py-2 px-2 text-xs text-cyan-500 font-mono hidden md:table-cell">STAR_TYPE</th>
              <th className="text-left py-2 px-2 text-xs text-cyan-500 font-mono hidden lg:table-cell">DISCOVERY</th>
              <th className="text-left py-2 px-2 text-xs text-cyan-500 font-mono">YEAR</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500 font-mono">
                  NO_RESULTS_FOUND
                </td>
              </tr>
            ) : (
              data.map((planet, index) => (
                <tr
                  key={planet.name}
                  className="border-b border-cyan-900/30 hover:bg-cyan-900/20 transition-colors"
                >
                  <td className="py-2 px-2">
                    <div className="text-cyan-300 font-mono">{planet.name}</div>
                    <div className="text-xs text-gray-500">{planet.hostStar}</div>
                  </td>
                  <td className="py-2 px-2 text-cyan-400 font-mono">
                    {planet.distanceLightYears ? `${planet.distanceLightYears} ly` : 'N/A'}
                  </td>
                  <td className="py-2 px-2 text-gray-400 font-mono text-xs hidden md:table-cell">
                    {planet.starType.split(' ')[0]}
                  </td>
                  <td className="py-2 px-2 text-gray-400 font-mono text-xs hidden lg:table-cell">
                    {planet.discoveryMethod}
                  </td>
                  <td className="py-2 px-2 text-gray-400 font-mono">
                    {planet.discoveryYear || 'N/A'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-cyan-900/30">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className={`px-3 py-1 rounded font-mono text-xs ${
              page === 1
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                : 'bg-cyan-900/50 text-cyan-300 hover:bg-cyan-800/50'
            }`}
          >
            PREV
          </button>
          <span className="text-xs text-gray-400 font-mono">
            PAGE {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className={`px-3 py-1 rounded font-mono text-xs ${
              page === totalPages
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                : 'bg-cyan-900/50 text-cyan-300 hover:bg-cyan-800/50'
            }`}
          >
            NEXT
          </button>
        </div>
      )}
    </div>
  )
}
