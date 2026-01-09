export default function SpacecraftCardRow({ spacecraft, onSelect }) {
  return (
    <div
      className="spacecraft-card-row"
      style={{
        display: 'grid',
        gridTemplateColumns: '180px 1fr',
        gap: 16,
        padding: 16,
        borderRadius: 18,
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.03)',
        alignItems: 'stretch',
      }}
    >
      <div
        style={{
          width: '100%',
          height: 180,
          borderRadius: 12,
          overflow: 'hidden',
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {spacecraft.imageUrl ? (
          <img
            src={spacecraft.thumbnailUrl || spacecraft.imageUrl}
            alt={spacecraft.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
        ) : null}
        <div
          style={{
            display: spacecraft.imageUrl ? 'none' : 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255,255,255,0.3)',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: 12,
          }}
        >
          <span style={{ fontSize: 32 }}>🛸</span>
          <span>NO IMAGE</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              opacity: 0.7,
              fontSize: 11,
              color: '#f97316',
            }}
          >
            {spacecraft.agencyAbbrev || spacecraft.agencyName}
          </span>
          {spacecraft.humanRated && (
            <span
              style={{
                fontSize: 10,
                padding: '2px 6px',
                borderRadius: 4,
                background: 'rgba(59, 130, 246, 0.2)',
                color: '#3b82f6',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              }}
            >
              HUMAN RATED
            </span>
          )}
          {spacecraft.inUse && (
            <span
              style={{
                fontSize: 10,
                padding: '2px 6px',
                borderRadius: 4,
                background: 'rgba(34, 197, 94, 0.2)',
                color: '#22c55e',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              }}
            >
              IN USE
            </span>
          )}
          {spacecraft.countryCode && (
            <span style={{ fontSize: 11, opacity: 0.5 }}>
              {spacecraft.countryCode}
            </span>
          )}
        </div>

        <div style={{ fontSize: 20, fontWeight: 700 }}>{spacecraft.name}</div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
            marginTop: 4,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                color: '#f97316',
                opacity: 0.8,
              }}
            >
              TYPE
            </div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>
              {spacecraft.typeName}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 10,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                color: '#f97316',
                opacity: 0.8,
              }}
            >
              AGENCY
            </div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>
              {spacecraft.agencyName}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 10,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                color: '#f97316',
                opacity: 0.8,
              }}
            >
              CREW CAPACITY
            </div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>
              {spacecraft.crewCapacity || 'N/A'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 'auto', alignItems: 'center' }}>
          <button
            onClick={() => onSelect(spacecraft.id)}
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              border: '1px solid rgba(249, 115, 22, 0.3)',
              background: 'rgba(249, 115, 22, 0.15)',
              cursor: 'pointer',
              fontWeight: 700,
              color: '#f97316',
              fontSize: 13,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            }}
          >
            LOAD VEHICLE FILE
          </button>

          {spacecraft.maidenFlight && (
            <div style={{ opacity: 0.5, fontSize: 11, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
              MAIDEN: {spacecraft.maidenFlight}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .spacecraft-card-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
