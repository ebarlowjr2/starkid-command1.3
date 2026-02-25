import { useNavigate } from 'react-router-dom'

export default function RocketsSectionPage() {
  const navigate = useNavigate()

  const sections = [
    {
      id: 'launch-vehicles',
      title: 'Launch Vehicles',
      description: 'Rockets that lift off from Earth (Falcon 9, Atlas V, Ariane, etc.)',
      route: '/rockets/launch-vehicles',
      icon: '🚀',
    },
    {
      id: 'spacecraft',
      title: 'Spacecraft & Shuttles',
      description: 'Vehicles that ride rockets (Dragon, Orion, Soyuz, cargo resupply, etc.)',
      route: '/rockets/spacecraft',
      icon: '🛸',
    },
  ]

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-wider text-orange-400 font-mono">
          ROCKET SCIENCE
        </h1>
        <p className="text-sm text-orange-200/70 font-mono">
          SELECT A VEHICLE CATEGORY TO EXPLORE
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 24,
          maxWidth: 900,
        }}
      >
        {sections.map((section) => (
          <div
            key={section.id}
            style={{
              padding: 24,
              borderRadius: 20,
              border: '1px solid rgba(249, 115, 22, 0.2)',
              background: 'rgba(0,0,0,0.4)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div style={{ fontSize: 48 }}>{section.icon}</div>
            
            <div>
              <h2
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: '#fff',
                  marginBottom: 8,
                }}
              >
                {section.title}
              </h2>
              <p
                style={{
                  fontSize: 14,
                  color: 'rgba(255,255,255,0.7)',
                  lineHeight: 1.5,
                }}
              >
                {section.description}
              </p>
            </div>

            <button
              onClick={() => navigate(section.route)}
              style={{
                marginTop: 'auto',
                padding: '12px 20px',
                borderRadius: 12,
                border: '1px solid rgba(249, 115, 22, 0.4)',
                background: 'rgba(249, 115, 22, 0.2)',
                cursor: 'pointer',
                fontWeight: 700,
                color: '#f97316',
                fontSize: 14,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                letterSpacing: '0.05em',
              }}
            >
              ENTER
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
