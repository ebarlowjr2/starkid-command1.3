import { PlanetModelViewer } from './PlanetModelViewer.jsx'

function getCta(lockedStatus) {
  if (lockedStatus === "live") return "Initiate Mission"
  if (lockedStatus === "coming_soon") return "Awaiting Launch Window"
  return "Systems Offline"
}

export function PlanetCardRow({ planet, onSelect }) {
  const disabled = planet.lockedStatus !== "live"
  const cta = getCta(planet.lockedStatus)

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "300px 1fr",
        gap: 16,
        padding: 16,
        borderRadius: 18,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.03)",
        alignItems: "stretch",
        opacity: disabled ? 0.6 : 1,
      }}
      className="planet-card-row"
    >
      <PlanetModelViewer modelSrc={planet.modelSrc} alt={`${planet.name} 3D model`} height={220} />

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", opacity: 0.8, fontSize: 12 }}>
          {planet.tagline}
        </div>

        <div style={{ fontSize: 22, fontWeight: 700 }}>{planet.name}</div>

        <div style={{ opacity: 0.85, lineHeight: 1.4 }}>{planet.shortDescription}</div>

        <div style={{ display: "flex", gap: 10, marginTop: "auto", alignItems: "center" }}>
          <button
            onClick={() => onSelect(planet.id)}
            disabled={disabled}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              background: disabled ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.12)",
              cursor: disabled ? "not-allowed" : "pointer",
              fontWeight: 700,
              color: "white",
              fontSize: 14,
            }}
          >
            {cta}
          </button>

          <div style={{ opacity: 0.65, fontSize: 12 }}>
            SOURCE:{" "}
            <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
              NASA glTF embed
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 840px) {
          .planet-card-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
