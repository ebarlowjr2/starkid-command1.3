import { useNavigate } from 'react-router-dom'
import useRockets from './hooks/useRockets.js'
import RocketCardRow from '../../components/rockets/RocketCardRow.jsx'

export default function RocketsHubPage() {
  const navigate = useNavigate()
  const {
    loading,
    error,
    rockets,
    totalCount,
    filteredCount,
    fromCache,
    filters,
    updateFilters,
    clearFilters,
    sortBy,
    setSortBy,
    manufacturers,
    refresh
  } = useRockets()

    const handleRocketSelect = (rocketId) => {
      navigate(`/rockets/launch-vehicles/${rocketId}`)
    }

  return (
    <div className="p-4">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <button
                    onClick={() => navigate('/rockets')}
                    className="mb-2 px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-lg text-orange-300 font-mono text-xs hover:bg-orange-500/30"
                  >
                    &larr; BACK TO ROCKET SCIENCE
                  </button>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-wider text-orange-400 font-mono">
                    LAUNCH VEHICLES
                  </h1>
                  <p className="text-sm text-orange-200/70 font-mono">
                    ACTIVE ROCKETS • PERFORMANCE DATA • SPECIFICATIONS
                  </p>
                </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : error ? 'bg-yellow-500' : 'bg-green-500'}`} />
            <span className="text-xs font-mono text-orange-300">
              {loading ? 'SYNCING' : fromCache ? 'CACHED' : 'LIVE'}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-yellow-900/30 border-l-4 border-yellow-500 text-yellow-200 font-mono text-xs">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-3 items-center mb-4">
          <input
            type="text"
            placeholder="Search rockets..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="px-3 py-2 bg-black/40 border border-orange-500/30 rounded-lg text-white placeholder-orange-300/50 font-mono text-sm focus:outline-none focus:border-orange-500"
            style={{ minWidth: 200 }}
          />

          <select
            value={filters.manufacturer || ''}
            onChange={(e) => updateFilters({ manufacturer: e.target.value || null })}
            className="px-3 py-2 bg-black/40 border border-orange-500/30 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-orange-500"
          >
            <option value="">All Manufacturers</option>
            {manufacturers.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <select
            value={filters.reusable === null ? '' : filters.reusable ? 'true' : 'false'}
            onChange={(e) => updateFilters({ 
              reusable: e.target.value === '' ? null : e.target.value === 'true' 
            })}
            className="px-3 py-2 bg-black/40 border border-orange-500/30 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-orange-500"
          >
            <option value="">All Types</option>
            <option value="true">Reusable</option>
            <option value="false">Expendable</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-black/40 border border-orange-500/30 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-orange-500"
          >
            <option value="name">Sort: Name</option>
            <option value="thrust">Sort: Most Powerful</option>
            <option value="payload">Sort: Highest Payload</option>
            <option value="launches">Sort: Most Launches</option>
          </select>

          {(filters.search || filters.manufacturer || filters.reusable !== null) && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 bg-orange-500/20 border border-orange-500/30 rounded-lg text-orange-300 font-mono text-sm hover:bg-orange-500/30"
            >
              Clear Filters
            </button>
          )}

          <button
            onClick={refresh}
            disabled={loading}
            className="px-3 py-2 bg-orange-500/20 border border-orange-500/30 rounded-lg text-orange-300 font-mono text-sm hover:bg-orange-500/30 disabled:opacity-50"
          >
            {loading ? 'LOADING...' : 'REFRESH'}
          </button>
        </div>

        <div className="text-xs font-mono text-orange-300/60 mb-4">
          SHOWING {filteredCount} OF {totalCount} ACTIVE VEHICLES
        </div>
      </div>

      {loading && rockets.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-orange-400 font-mono animate-pulse">
            LOADING VEHICLE DATABASE...
          </div>
        </div>
      ) : rockets.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-orange-300/60 font-mono">
            NO VEHICLES MATCH YOUR FILTERS
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {rockets.map((rocket) => (
            <RocketCardRow
              key={rocket.id}
              rocket={rocket}
              onSelect={handleRocketSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}
