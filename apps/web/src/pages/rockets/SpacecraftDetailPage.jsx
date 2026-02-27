import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getSpacecraftById } from '@starkid/core'

export default function SpacecraftDetailPage() {
  const { spacecraftId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [spacecraft, setSpacecraft] = useState(null)

  useEffect(() => {
    async function loadSpacecraft() {
      setLoading(true)
      setError(null)
      
      try {
        const result = await getSpacecraftById(spacecraftId)
        setSpacecraft(result.spacecraft)
      } catch (err) {
        console.error('Error loading spacecraft:', err)
        setError(err.message || 'Failed to load spacecraft data')
      } finally {
        setLoading(false)
      }
    }
    
    loadSpacecraft()
  }, [spacecraftId])

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="text-orange-400 font-mono animate-pulse py-12">
          LOADING VEHICLE DATA...
        </div>
      </div>
    )
  }

  if (error || !spacecraft) {
    return (
      <div className="p-4">
        <button
          onClick={() => navigate('/rockets/spacecraft')}
          className="mb-4 px-3 py-2 bg-orange-500/20 border border-orange-500/30 rounded-lg text-orange-300 font-mono text-sm"
        >
          &larr; BACK TO SPACECRAFT
        </button>
        <div className="text-center py-12">
          <div className="text-red-400 font-mono">
            {error || 'VEHICLE NOT FOUND'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <button
        onClick={() => navigate('/rockets/spacecraft')}
        className="mb-4 px-3 py-2 bg-orange-500/20 border border-orange-500/30 rounded-lg text-orange-300 font-mono text-sm hover:bg-orange-500/30"
      >
        &larr; BACK TO SPACECRAFT
      </button>

      <div className="mb-4">
        <div className="flex items-center gap-3 mb-1 flex-wrap">
          <span className="text-orange-400 font-mono text-sm">
            {spacecraft.agencyName}
          </span>
          {spacecraft.humanRated && (
            <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded font-mono">
              HUMAN RATED
            </span>
          )}
          {spacecraft.inUse && (
            <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded font-mono">
              IN USE
            </span>
          )}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white">
          {spacecraft.name}
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
            {spacecraft.imageUrl ? (
              <img
                src={spacecraft.imageUrl}
                alt={spacecraft.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-orange-300/30 font-mono">
                <div className="text-center">
                  <span style={{ fontSize: 64 }}>🛸</span>
                  <div className="mt-2">NO IMAGE AVAILABLE</div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {spacecraft.wikiUrl && (
              <a
                href={spacecraft.wikiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-3 py-2 bg-orange-500/20 border border-orange-500/30 rounded-lg text-orange-300 font-mono text-sm text-center hover:bg-orange-500/30"
              >
                WIKIPEDIA
              </a>
            )}
            {spacecraft.infoUrl && (
              <a
                href={spacecraft.infoUrl}
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
            {spacecraft.description && (
              <p className="text-white/80 text-sm leading-relaxed mb-4">
                {spacecraft.description}
              </p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <DataField label="TYPE" value={spacecraft.typeName} />
              <DataField label="AGENCY" value={spacecraft.agencyName} />
              <DataField label="COUNTRY" value={spacecraft.countryName || 'N/A'} />
              <DataField label="MAIDEN FLIGHT" value={spacecraft.maidenFlight || 'N/A'} />
            </div>
          </Module>

          <Module title="CAPABILITIES">
            <div className="grid grid-cols-2 gap-3">
              <DataField 
                label="CREW CAPACITY" 
                value={spacecraft.crewCapacity ? `${spacecraft.crewCapacity} astronauts` : 'Not provided by API'} 
                highlight={!!spacecraft.crewCapacity}
              />
              <DataField 
                label="HUMAN RATED" 
                value={spacecraft.humanRated ? 'YES' : 'NO'} 
                highlight={spacecraft.humanRated}
              />
              <DataField 
                label="FLIGHT LIFE" 
                value={spacecraft.flightLife || 'Not provided by API'} 
              />
              <DataField 
                label="STATUS" 
                value={spacecraft.inUse ? 'ACTIVE' : 'RETIRED'} 
                highlight={spacecraft.inUse}
              />
            </div>
            {spacecraft.capability && (
              <div className="mt-3 pt-3 border-t border-orange-500/20">
                <DataField label="MISSION CAPABILITY" value={spacecraft.capability} />
              </div>
            )}
          </Module>

          {spacecraft.history && (
            <Module title="SYSTEM NOTES">
              <p className="text-white/70 text-sm leading-relaxed">
                {spacecraft.history}
              </p>
            </Module>
          )}

          <Module title="CLASSIFICATION">
            <div className="grid grid-cols-2 gap-3">
              <DataField label="VEHICLE CLASS" value={spacecraft.typeName} />
              <DataField label="OPERATOR" value={spacecraft.agencyAbbrev || spacecraft.agencyName} />
            </div>
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
