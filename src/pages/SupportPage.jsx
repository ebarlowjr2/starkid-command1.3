import { useNavigate } from 'react-router-dom'

export default function SupportPage() {
  const navigate = useNavigate()

  return (
    <div className="p-4" style={{ maxWidth: 900, margin: '0 auto' }}>
      <button
        onClick={() => navigate('/explore')}
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
        ← BACK TO EXPLORE
      </button>

      <h1
        style={{
          fontSize: 32,
          fontWeight: 700,
          color: '#fff',
          marginBottom: 8,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        }}
      >
        SUPPORT THE MISSION
      </h1>
      <p
        style={{
          fontSize: 14,
          color: 'rgba(255,255,255,0.6)',
          marginBottom: 32,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        }}
      >
        Help keep StarKid Command running and growing.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        <section
          style={{
            padding: 24,
            borderRadius: 16,
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(34, 211, 238, 0.2)',
          }}
        >
          <h2
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#22d3ee',
              marginBottom: 16,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            }}
          >
            WHY STARKID COMMAND EXISTS
          </h2>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7 }}>
            <p style={{ marginBottom: 12 }}>
              StarKid Command was built to make space exploration accessible and engaging for everyone — 
              from curious kids to lifelong enthusiasts.
            </p>
            <ul style={{ margin: 0, padding: '0 0 0 20px', listStyle: 'disc' }}>
              <li style={{ marginBottom: 8 }}>Enthusiast-driven: Built by space fans, for space fans</li>
              <li style={{ marginBottom: 8 }}>Educational: Real data from NASA, ESA, and space agencies worldwide</li>
              <li style={{ marginBottom: 8 }}>No ads: Your attention stays on the stars, not sponsors</li>
              <li style={{ marginBottom: 8 }}>Public access: Free for everyone, always</li>
            </ul>
          </div>
        </section>

        <section
          style={{
            padding: 24,
            borderRadius: 16,
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(249, 115, 22, 0.2)',
          }}
        >
          <h2
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#f97316',
              marginBottom: 16,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            }}
          >
            WHAT IT TAKES TO RUN
          </h2>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7 }}>
            <p style={{ marginBottom: 12 }}>
              Keeping StarKid Command online and up-to-date requires ongoing resources:
            </p>
            <ul style={{ margin: 0, padding: '0 0 0 20px', listStyle: 'disc' }}>
              <li style={{ marginBottom: 8 }}>Hosting and infrastructure costs</li>
              <li style={{ marginBottom: 8 }}>API access and data services</li>
              <li style={{ marginBottom: 8 }}>Development time for new features and maintenance</li>
              <li style={{ marginBottom: 8 }}>Research and verification of space data</li>
            </ul>
          </div>
        </section>

        <section
          style={{
            padding: 24,
            borderRadius: 16,
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(168, 85, 247, 0.2)',
          }}
        >
          <h2
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#a855f7',
              marginBottom: 16,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            }}
          >
            HOW YOU CAN HELP
          </h2>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
              <div
                style={{
                  padding: 16,
                  borderRadius: 12,
                  background: 'rgba(168, 85, 247, 0.1)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 8 }}>💜</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#a855f7', marginBottom: 4 }}>Donate</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Coming soon</div>
              </div>
              <div
                style={{
                  padding: 16,
                  borderRadius: 12,
                  background: 'rgba(34, 211, 238, 0.1)',
                  border: '1px solid rgba(34, 211, 238, 0.3)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 8 }}>📚</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#22d3ee', marginBottom: 4 }}>Share with Educators</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Teachers, parents, clubs</div>
              </div>
              <div
                style={{
                  padding: 16,
                  borderRadius: 12,
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 8 }}>💬</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#22c55e', marginBottom: 4 }}>Send Feedback</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Ideas and suggestions</div>
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            padding: 24,
            borderRadius: 16,
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
          }}
        >
          <h2
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#22c55e',
              marginBottom: 16,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            }}
          >
            OUR COMMITMENT
          </h2>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  borderRadius: 8,
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                }}
              >
                <span style={{ color: '#22c55e' }}>●</span>
                <span>No ads</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  borderRadius: 8,
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                }}
              >
                <span style={{ color: '#22c55e' }}>●</span>
                <span>No tracking</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  borderRadius: 8,
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                }}
              >
                <span style={{ color: '#22c55e' }}>●</span>
                <span>Open access</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
