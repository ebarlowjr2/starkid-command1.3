import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  getRocketById, 
  formatThrust, 
  formatPayload, 
  formatLength, 
  formatMass 
} from '@starkid/core'

export default function RocketDetailPage() {
  const { rocketId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [rocket, setRocket] = useState(null)

  useEffect(() => {
    async function loadRocket() {
      setLoading(true)
      setError(null)
      
      try {
        const result = await getRocketById(rocketId)
        setRocket(result.rocket)
      } catch (err) {
        console.error('Error loading rocket:', err)
        setError(err.message || 'Failed to load rocket data')
      } finally {
        setLoading(false)
      }
    }
    
    loadRocket()
  }, [rocketId])

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="text-orange-400 font-mono animate-pulse py-12">
          LOADING VEHICLE DATA...
        </div>
      </div>
    )
  }

  if (error || !rocket) {
    return (
      <div className="p-4">
        <button
          onClick={() => navigate('/rockets/launch-vehicles')}
          className="mb-4 px-3 py-2 bg-orange-500/20 border border-orange-500/30 rounded-lg text-orange-300 font-mono text-sm"
        >
          &larr; BACK TO VEHICLES
        </button>
        <div className="text-center py-12">
          <div className="text-red-400 font-mono">
            {error || 'VEHICLE NOT FOUND'}
          </div>
        </div>
      </div>
    )
  }

  const successRate = rocket.totalLaunches > 0 
    ? ((rocket.successfulLaunches / rocket.totalLaunches) * 100).toFixed(1)
    : 'N/A'

  const landingRate = rocket.attemptedLandings > 0
    ? ((rocket.successfulLandings / rocket.attemptedLandings) * 100).toFixed(1)
    : null

  return (
    <div className="p-4">
      <button
        onClick={() => navigate('/rockets/launch-vehicles')}
        className="mb-4 px-3 py-2 bg-orange-500/20 border border-orange-500/30 rounded-lg text-orange-300 font-mono text-sm hover:bg-orange-500/30"
      >
        &larr; BACK TO VEHICLES
      </button>

      <div className="mb-4">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-orange-400 font-mono text-sm">
            {rocket.manufacturerName}
          </span>
          {rocket.reusable && (
            <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded font-mono">
              REUSABLE
            </span>
          )}
          {rocket.active && (
            <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded font-mono">
              ACTIVE
            </span>
          )}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white">
          {rocket.fullName || rocket.name}
        </h1>
      </div>

      <div 
        className="grid gap-6"
        style={{ gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1.5fr)' }}
      >
        <div className="flex flex-col gap-4">
          <div
            style={{
              width: '100%',
              aspectRatio: '3/4',
              maxHeight: 500,
              borderRadius: 16,
              overflow: 'hidden',
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(249, 115, 22, 0.2)',
            }}
          >
            {rocket.imageUrl ? (
              <img
                src={rocket.imageUrl}
                alt={rocket.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-orange-300/30 font-mono">
                <div className="text-center">
                  <span style={{ fontSize: 64 }}>🚀</span>
                  <div className="mt-2">NO IMAGE AVAILABLE</div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {rocket.wikiUrl && (
              <a
                href={rocket.wikiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-3 py-2 bg-orange-500/20 border border-orange-500/30 rounded-lg text-orange-300 font-mono text-sm text-center hover:bg-orange-500/30"
              >
                WIKIPEDIA
              </a>
            )}
            {rocket.infoUrl && (
              <a
                href={rocket.infoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-3 py-2 bg-orange-500/20 border border-orange-500/30 rounded-lg text-orange-300 font-mono text-sm text-center hover:bg-orange-500/30"
              >
                OFFICIAL SITE
              </a>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Module title="VEHICLE OVERVIEW">
            {rocket.description && (
              <p className="text-white/80 text-sm leading-relaxed mb-4">
                {rocket.description}
              </p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <DataField label="MANUFACTURER" value={rocket.manufacturerName} />
              <DataField label="COUNTRY" value={rocket.countryName || 'N/A'} />
              <DataField label="MAIDEN FLIGHT" value={rocket.maidenFlight || 'N/A'} />
              <DataField label="FAMILY" value={rocket.familyName || 'N/A'} />
            </div>
          </Module>

          <Module title="PERFORMANCE">
            <div className="grid grid-cols-2 gap-3">
              <DataField 
                label="LEO PAYLOAD" 
                value={formatPayload(rocket.leoCapacityKg)} 
                highlight 
              />
              <DataField 
                label="GTO PAYLOAD" 
                value={formatPayload(rocket.gtoCapacityKg)} 
                highlight 
              />
              <DataField 
                label="LIFTOFF THRUST" 
                value={formatThrust(rocket.toThrustKN)} 
                highlight 
              />
              <DataField 
                label="LAUNCH MASS" 
                value={formatMass(rocket.launchMassT)} 
              />
            </div>
          </Module>

          <Module title="DIMENSIONS">
            <div className="grid grid-cols-3 gap-3">
              <DataField 
                label="LENGTH" 
                value={formatLength(rocket.lengthM)} 
              />
              <DataField 
                label="DIAMETER" 
                value={formatLength(rocket.diameterM)} 
              />
              <DataField 
                label="STAGES" 
                value="2" 
              />
            </div>
          </Module>

          <Module title="LAUNCH STATISTICS">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <DataField 
                label="TOTAL LAUNCHES" 
                value={rocket.totalLaunches} 
                highlight 
              />
              <DataField 
                label="SUCCESSFUL" 
                value={rocket.successfulLaunches} 
              />
              <DataField 
                label="FAILED" 
                value={rocket.failedLaunches} 
              />
              <DataField 
                label="SUCCESS RATE" 
                value={successRate !== 'N/A' ? `${successRate}%` : 'N/A'} 
                highlight 
              />
            </div>
            {rocket.reusable && landingRate && (
              <div className="mt-3 pt-3 border-t border-orange-500/20">
                <div className="grid grid-cols-3 gap-3">
                  <DataField 
                    label="LANDING ATTEMPTS" 
                    value={rocket.attemptedLandings} 
                  />
                  <DataField 
                    label="SUCCESSFUL LANDINGS" 
                    value={rocket.successfulLandings} 
                  />
                  <DataField 
                    label="LANDING RATE" 
                    value={`${landingRate}%`} 
                    highlight 
                  />
                </div>
              </div>
            )}
          </Module>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .grid[style*="minmax(300px, 1fr) minmax(300px, 1.5fr)"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}

function Module({ title, children }) {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 16,
        border: '1px solid rgba(249, 115, 22, 0.2)',
        background: 'rgba(0,0,0,0.3)',
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          color: '#f97316',
          marginBottom: 12,
          letterSpacing: '0.05em',
        }}
      >
        {title}
      </div>
      {children}
    </div>
  )
}

function DataField({ label, value, highlight }) {
  return (
    <div>
      <div
        style={{
          fontSize: 10,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          color: 'rgba(249, 115, 22, 0.7)',
          marginBottom: 2,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: highlight ? 18 : 14,
          fontWeight: highlight ? 700 : 500,
          color: highlight ? '#fff' : 'rgba(255,255,255,0.85)',
        }}
      >
        {value}
      </div>
    </div>
  )
}
