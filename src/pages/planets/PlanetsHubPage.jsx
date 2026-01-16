import { useNavigate } from 'react-router-dom'
import { PLANETS } from '../../config/planets.js'
import { PlanetCardRow } from '../../components/PlanetCardRow.jsx'

export default function PlanetsHubPage() {
  const navigate = useNavigate()

  const handlePlanetSelect = (planetId) => {
    const planet = PLANETS.find(p => p.id === planetId)
    if (planet && planet.lockedStatus === 'live') {
      navigate(`/planets/${planetId}`)
    }
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-wider text-cyan-300 mb-2">
          VISIT ANOTHER PLANET
        </h1>
        <p className="text-sm text-cyan-200/70 font-mono">
          SELECT A DESTINATION TO EXPLORE PLANETARY COMMAND CENTERS
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {PLANETS.map((planet) => (
          <PlanetCardRow
            key={planet.id}
            planet={planet}
            onSelect={handlePlanetSelect}
          />
        ))}
      </div>
    </div>
  )
}
