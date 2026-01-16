import { useNavigate } from 'react-router-dom'
import {
  ARTEMIS_SPACECRAFT,
  ARTEMIS_IMAGES,
  ARTEMIS_SYSTEMS,
  MISSION_STATUS_COLORS,
} from '../../config/missions/artemis'

export default function OrionDetailPage() {
  const navigate = useNavigate()
  const orion = ARTEMIS_SPACECRAFT.orion

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
          border: '1px solid rgba(34, 211, 238, 0.3)',
          background: 'rgba(34, 211, 238, 0.1)',
          cursor: 'pointer',
          color: '#22d3ee',
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
            border: '1px solid rgba(34, 211, 238, 0.3)',
          }}
        >
          <img
            src={ARTEMIS_IMAGES.orionEarth.url}
            alt={ARTEMIS_IMAGES.orionEarth.alt}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
            }}
          />
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>
              {ARTEMIS_IMAGES.orionEarth.caption}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', marginTop: 4 }}>
              Credit: {ARTEMIS_IMAGES.orionEarth.credit}
            </div>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: '#22d3ee',
                margin: 0,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              }}
            >
              {orion.name}
            </h1>
            <span
              style={{
                ...getStatusStyle(orion.status),
                padding: '4px 12px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 700,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              }}
            >
              {orion.status}
            </span>
          </div>

          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 24, lineHeight: 1.6 }}>
            Orion is NASA's next-generation spacecraft designed to carry astronauts to the Moon and beyond. 
            It is the only spacecraft currently capable of high-speed re-entry from deep space, protecting 
            astronauts as they return to Earth at speeds of 25,000 mph from lunar distances.
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 16,
              padding: 20,
              borderRadius: 12,
              background: 'rgba(34, 211, 238, 0.05)',
              border: '1px solid rgba(34, 211, 238, 0.2)',
            }}
          >
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 2, fontFamily: 'monospace' }}>
                VEHICLE TYPE
              </div>
              <div style={{ fontSize: 14, color: '#fff', fontFamily: 'monospace' }}>
                {orion.type}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 2, fontFamily: 'monospace' }}>
                MANUFACTURER
              </div>
              <div style={{ fontSize: 14, color: '#fff', fontFamily: 'monospace' }}>
                {orion.manufacturer}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 2, fontFamily: 'monospace' }}>
                CREW CAPACITY
              </div>
              <div style={{ fontSize: 14, color: '#fff', fontFamily: 'monospace' }}>
                {orion.crewCapacity} astronauts
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 2, fontFamily: 'monospace' }}>
                MISSION DURATION
              </div>
              <div style={{ fontSize: 14, color: '#fff', fontFamily: 'monospace' }}>
                {orion.missionDuration}
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
        SPACECRAFT COMPONENTS
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
            border: '1px solid rgba(34, 211, 238, 0.3)',
          }}
        >
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#22d3ee', marginBottom: 16 }}>
            Crew Module
          </h3>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 16, lineHeight: 1.5 }}>
            The pressurized capsule where astronauts live and work during missions. Features advanced 
            life support, navigation, and control systems. Designed to be reusable for up to 10 missions.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'DIAMETER', value: '5.02 m' },
              { label: 'HABITABLE VOLUME', value: '8.95 m³' },
              { label: 'CREW CAPACITY', value: '4 astronauts' },
              { label: 'REUSABILITY', value: 'Up to 10 flights' },
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
        </div>

        <div
          style={{
            padding: 24,
            borderRadius: 16,
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#3b82f6', margin: 0 }}>
              European Service Module
            </h3>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: 4,
                background: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                fontSize: 9,
                color: '#3b82f6',
                fontFamily: 'monospace',
              }}
            >
              ESA
            </span>
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 16, lineHeight: 1.5 }}>
            Built by Airbus for ESA, the service module provides propulsion, power, thermal control, 
            and consumables (air, water) for the crew module. Based on the ATV cargo spacecraft design.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'PROVIDER', value: orion.serviceModuleProvider },
              { label: 'SOLAR POWER', value: '11 kW' },
              { label: 'MAIN ENGINE', value: 'AJ10-190' },
              { label: 'THRUSTERS', value: '33 auxiliary' },
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
        CAPABILITIES
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}
      >
        {orion.capabilities.map((cap, i) => (
          <div
            key={i}
            style={{
              padding: 16,
              borderRadius: 12,
              background: 'rgba(34, 211, 238, 0.05)',
              border: '1px solid rgba(34, 211, 238, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <span style={{ color: '#22d3ee', fontSize: 18 }}>•</span>
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>{cap}</span>
          </div>
        ))}
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
            label: 'HEAT SHIELD',
            value: orion.heatShield,
            detail: 'Largest heat shield ever built, 16.5 feet in diameter',
          },
          {
            label: 'RE-ENTRY SPEED',
            value: orion.reentrySpeed,
            detail: 'Fastest re-entry speed for any human-rated spacecraft',
          },
          {
            label: 'DISTANCE RECORD',
            value: '432,210 km from Earth',
            detail: 'Farthest any spacecraft designed for humans has traveled',
          },
          {
            label: 'LAUNCH ABORT SYSTEM',
            value: 'Can pull crew to safety in 2 seconds',
            detail: 'Generates 400,000 lbs of thrust for emergency escape',
          },
          {
            label: 'PARACHUTE SYSTEM',
            value: '11 parachutes total',
            detail: '3 main chutes, each 116 feet in diameter',
          },
          {
            label: 'GLASS COCKPIT',
            value: '3 display screens',
            detail: 'Modern digital interface replacing Apollo-era switches',
          },
        ].map((fact) => (
          <div
            key={fact.label}
            style={{
              padding: 16,
              borderRadius: 12,
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(34, 211, 238, 0.2)',
            }}
          >
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 4, fontFamily: 'monospace' }}>
              {fact.label}
            </div>
            <div style={{ fontSize: 16, color: '#22d3ee', fontWeight: 600, marginBottom: 4 }}>
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
