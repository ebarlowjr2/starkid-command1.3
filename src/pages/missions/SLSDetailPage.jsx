import { useNavigate } from 'react-router-dom'
import {
  ARTEMIS_ROCKETS,
  ARTEMIS_IMAGES,
  ARTEMIS_MISSIONS,
  MISSION_STATUS_COLORS,
} from '../../config/missions/artemis'

export default function SLSDetailPage() {
  const navigate = useNavigate()
  const sls = ARTEMIS_ROCKETS.sls
  const block1 = sls.configurations.block1
  const block1b = sls.configurations.block1b

  const getStatusStyle = (status) => {
    const colors = MISSION_STATUS_COLORS[status] || MISSION_STATUS_COLORS.TBD
    return {
      background: colors.bg,
      border: `1px solid ${colors.border}`,
      color: colors.text,
    }
  }

  return (
    <div className="p-4" style={{ maxWidth: 1200, margin: '0 auto' }}>
      <button
        onClick={() => navigate('/missions/artemis')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 16px',
          borderRadius: 8,
          border: '1px solid rgba(249, 115, 22, 0.3)',
          background: 'rgba(249, 115, 22, 0.1)',
          cursor: 'pointer',
          color: '#f97316',
          fontSize: 12,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          marginBottom: 24,
        }}
      >
        ← BACK TO ARTEMIS
      </button>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(300px, 1fr) 2fr',
          gap: 32,
          marginBottom: 32,
        }}
      >
        <div
          style={{
            borderRadius: 16,
            overflow: 'hidden',
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(249, 115, 22, 0.3)',
          }}
        >
          <img
            src={ARTEMIS_IMAGES.slsLaunch.url}
            alt={ARTEMIS_IMAGES.slsLaunch.alt}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
            }}
          />
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>
              {ARTEMIS_IMAGES.slsLaunch.caption}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', marginTop: 4 }}>
              Credit: {ARTEMIS_IMAGES.slsLaunch.credit}
            </div>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: '#f97316',
                margin: 0,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              }}
            >
              {sls.name}
            </h1>
            <span
              style={{
                ...getStatusStyle(sls.status),
                padding: '4px 12px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 700,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              }}
            >
              {sls.status}
            </span>
          </div>

          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 24, lineHeight: 1.6 }}>
            The Space Launch System is NASA's super heavy-lift launch vehicle designed to send astronauts 
            to the Moon and beyond. It is the most powerful rocket NASA has ever built, producing 8.8 million 
            pounds of thrust at liftoff - 15% more than the Saturn V that sent Apollo astronauts to the Moon.
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 16,
              padding: 20,
              borderRadius: 12,
              background: 'rgba(249, 115, 22, 0.05)',
              border: '1px solid rgba(249, 115, 22, 0.2)',
            }}
          >
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 2, fontFamily: 'monospace' }}>
                VEHICLE TYPE
              </div>
              <div style={{ fontSize: 14, color: '#fff', fontFamily: 'monospace' }}>
                {sls.type}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 2, fontFamily: 'monospace' }}>
                MANUFACTURER
              </div>
              <div style={{ fontSize: 14, color: '#fff', fontFamily: 'monospace' }}>
                {sls.manufacturer}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 2, fontFamily: 'monospace' }}>
                FIRST FLIGHT
              </div>
              <div style={{ fontSize: 14, color: '#fff', fontFamily: 'monospace' }}>
                {sls.firstFlight}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 2, fontFamily: 'monospace' }}>
                STATUS
              </div>
              <div style={{ fontSize: 14, color: '#22c55e', fontFamily: 'monospace' }}>
                {sls.status}
              </div>
            </div>
          </div>
        </div>
      </div>

      <h2
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.5)',
          marginBottom: 20,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        }}
      >
        VEHICLE CONFIGURATIONS
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: 24,
          marginBottom: 32,
        }}
      >
        <div
          style={{
            padding: 24,
            borderRadius: 16,
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(249, 115, 22, 0.3)',
          }}
        >
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f97316', marginBottom: 16 }}>
            SLS {block1.name}
          </h3>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 16, lineHeight: 1.5 }}>
            The initial configuration used for Artemis I, II, and III. Features the Interim Cryogenic 
            Propulsion Stage (ICPS) as the upper stage.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'HEIGHT', value: block1.height },
              { label: 'THRUST', value: block1.thrust },
              { label: 'PAYLOAD (LEO)', value: block1.payload_leo },
              { label: 'PAYLOAD (TLI)', value: block1.payload_tli },
              { label: 'STAGES', value: block1.stages },
              { label: 'BOOSTERS', value: block1.boosters },
            ].map((item) => (
              <div key={item.label}>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 13, color: '#fff', fontFamily: 'monospace' }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 8, fontFamily: 'monospace' }}>
              MISSIONS
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {block1.missions.map((m) => (
                <span
                  key={m}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    background: 'rgba(249, 115, 22, 0.2)',
                    border: '1px solid rgba(249, 115, 22, 0.3)',
                    fontSize: 11,
                    color: '#f97316',
                    fontFamily: 'monospace',
                  }}
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            padding: 24,
            borderRadius: 16,
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#a855f7', margin: 0 }}>
              SLS {block1b.name}
            </h3>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: 4,
                background: 'rgba(168, 85, 247, 0.2)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                fontSize: 9,
                color: '#a855f7',
                fontFamily: 'monospace',
              }}
            >
              FUTURE
            </span>
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 16, lineHeight: 1.5 }}>
            The upgraded configuration featuring the more powerful Exploration Upper Stage (EUS), 
            enabling larger payloads and co-manifested cargo delivery to lunar orbit.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'HEIGHT', value: block1b.height },
              { label: 'THRUST', value: block1b.thrust },
              { label: 'PAYLOAD (LEO)', value: block1b.payload_leo },
              { label: 'PAYLOAD (TLI)', value: block1b.payload_tli },
              { label: 'STAGES', value: block1b.stages },
              { label: 'UPPER STAGE', value: 'EUS' },
            ].map((item) => (
              <div key={item.label}>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 13, color: '#fff', fontFamily: 'monospace' }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 8, fontFamily: 'monospace' }}>
              MISSIONS
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {block1b.missions.map((m) => (
                <span
                  key={m}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    background: 'rgba(168, 85, 247, 0.2)',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    fontSize: 11,
                    color: '#a855f7',
                    fontFamily: 'monospace',
                  }}
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <h2
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.5)',
          marginBottom: 20,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        }}
      >
        KEY FACTS
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}
      >
        {[
          {
            label: 'THRUST COMPARISON',
            value: '15% more powerful than Saturn V',
            detail: 'SLS produces 8.8 million pounds of thrust at liftoff',
          },
          {
            label: 'CORE STAGE',
            value: '212 feet tall',
            detail: 'Largest rocket stage NASA has ever built, holding 733,000 gallons of propellant',
          },
          {
            label: 'RS-25 ENGINES',
            value: '4 engines per flight',
            detail: 'Heritage Space Shuttle Main Engines, upgraded for SLS',
          },
          {
            label: 'SOLID ROCKET BOOSTERS',
            value: '2 five-segment SRBs',
            detail: 'Each booster produces 3.6 million pounds of thrust',
          },
          {
            label: 'DEVELOPMENT COST',
            value: '$23+ billion',
            detail: 'Most expensive rocket development program in history',
          },
          {
            label: 'LAUNCH SITE',
            value: 'Kennedy Space Center',
            detail: 'Launch Complex 39B, same pad used for Apollo missions',
          },
        ].map((fact) => (
          <div
            key={fact.label}
            style={{
              padding: 16,
              borderRadius: 12,
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(249, 115, 22, 0.2)',
            }}
          >
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 4, fontFamily: 'monospace' }}>
              {fact.label}
            </div>
            <div style={{ fontSize: 16, color: '#f97316', fontWeight: 600, marginBottom: 4 }}>
              {fact.value}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>
              {fact.detail}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: minmax(300px, 1fr) 2fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
