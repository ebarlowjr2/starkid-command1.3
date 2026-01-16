import { useNavigate } from 'react-router-dom'

export default function SupportPage() {
  const navigate = useNavigate()

  return (
    <div className="p-4" style={{ maxWidth: 800, margin: '0 auto' }}>
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
          marginBottom: 32,
        }}
      >
        Back to Explore
      </button>

      <h1
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: '#fff',
          marginBottom: 48,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        }}
      >
        Support the Mission
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        <section>
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 1.8 }}>
            <p style={{ marginBottom: 16 }}>
              StarKid Command is free and open for everyone.
            </p>
            <p style={{ marginBottom: 16 }}>
              If you find value in this project and would like to support its continued development and hosting, you can choose to contribute.
            </p>
            <p>
              Contributions help cover infrastructure costs and allow the platform to remain ad-free and publicly accessible.
            </p>
          </div>
        </section>

        <section
          style={{
            padding: 24,
            borderRadius: 12,
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <h2
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#fff',
              marginBottom: 16,
            }}
          >
            How You Can Help
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button
              disabled
              style={{
                padding: '12px 20px',
                borderRadius: 8,
                border: '1px solid rgba(34, 211, 238, 0.3)',
                background: 'rgba(34, 211, 238, 0.1)',
                color: 'rgba(34, 211, 238, 0.6)',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'not-allowed',
                opacity: 0.7,
              }}
            >
              Support the Mission (Coming Soon)
            </button>
            <button
              disabled
              style={{
                padding: '12px 20px',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.5)',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'not-allowed',
                opacity: 0.7,
              }}
            >
              Make a Contribution (Coming Soon)
            </button>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 16 }}>
            Donation options will be available after the platform has supported its first major launch event.
          </p>
        </section>

        <section>
          <h2
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#fff',
              marginBottom: 16,
            }}
          >
            Other Ways to Help
          </h2>
          <ul style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 1.8, margin: 0, padding: '0 0 0 24px' }}>
            <li style={{ marginBottom: 8 }}>Share StarKid Command with educators, students, and space enthusiasts</li>
            <li style={{ marginBottom: 8 }}>Send feedback and suggestions to help improve the platform</li>
            <li>Spread the word during launch events and space milestones</li>
          </ul>
        </section>

        <section
          style={{
            padding: 24,
            borderRadius: 12,
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <h2
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#fff',
              marginBottom: 16,
            }}
          >
            Our Commitment
          </h2>
          <ul style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 1.8, margin: 0, padding: '0 0 0 24px' }}>
            <li style={{ marginBottom: 8 }}>No ads</li>
            <li style={{ marginBottom: 8 }}>No invasive tracking</li>
            <li>Open access for everyone</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
