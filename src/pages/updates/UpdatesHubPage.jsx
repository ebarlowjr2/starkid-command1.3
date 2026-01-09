import { useNavigate } from 'react-router-dom'

export default function UpdatesHubPage() {
  const navigate = useNavigate()

  const sections = [
    {
      id: 'news',
      title: 'News',
      description: 'Latest space news from NASA, ESA, SpaceX, and more. Aggregated from trusted sources.',
      route: '/updates/news',
      icon: '📰',
      status: 'live',
    },
    {
      id: 'blog',
      title: 'Blog',
      description: 'Mission logs, educational articles, and updates from StarKid Command.',
      route: '/updates/blog',
      icon: '📝',
      status: 'live',
    },
    {
      id: 'live',
      title: 'Live',
      description: 'Watch live rocket launches and space events from Everyday Astronaut and other channels.',
      route: '/updates/live',
      icon: '🔴',
      status: 'live',
    },
    {
      id: 'x',
      title: 'X Accounts',
      description: 'Curated X/Twitter accounts from space agencies, companies, journalists, and trackers.',
      route: '/updates/x',
      icon: '𝕏',
      status: 'live',
    },
  ]

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-wider text-cyan-400 font-mono">
          UPDATES
        </h1>
        <p className="text-sm text-cyan-200/70 font-mono">
          NEWS • BLOG • LIVE STREAMS
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 24,
          maxWidth: 1000,
        }}
      >
        {sections.map((section) => (
          <div
            key={section.id}
            style={{
              padding: 24,
              borderRadius: 20,
              border: '1px solid rgba(34, 211, 238, 0.2)',
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
                border: '1px solid rgba(34, 211, 238, 0.4)',
                background: 'rgba(34, 211, 238, 0.2)',
                cursor: 'pointer',
                fontWeight: 700,
                color: '#22d3ee',
                fontSize: 14,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                letterSpacing: '0.05em',
              }}
            >
              OPEN
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
