import { useNavigate } from 'react-router-dom'

export default function AboutPage() {
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
        About
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
        <section>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: '#fff',
              marginBottom: 16,
            }}
          >
            What Is StarKid Command?
          </h2>
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 1.8 }}>
            <p style={{ marginBottom: 16 }}>
              StarKid Command is a live mission-control interface for tracking, understanding, and exploring space.
            </p>
            <p>
              It brings together real mission data, spacecraft information, live events, and educational context into a single, interactive command-style experience.
            </p>
          </div>
        </section>

        <section>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: '#fff',
              marginBottom: 16,
            }}
          >
            Why StarKid Command Exists
          </h2>
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 1.8 }}>
            <p style={{ marginBottom: 16 }}>
              Space exploration information is often spread across many different sources — news articles, agency websites, videos, and technical documents.
            </p>
            <p>
              StarKid Command exists to bring those pieces together in a format that feels like a real operations console, allowing enthusiasts and learners to explore missions, vehicles, and events with context and clarity.
            </p>
          </div>
        </section>

        <section>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: '#fff',
              marginBottom: 16,
            }}
          >
            Who It's For
          </h2>
          <ul style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 1.8, margin: 0, padding: '0 0 0 24px' }}>
            <li style={{ marginBottom: 8 }}>Space enthusiasts</li>
            <li style={{ marginBottom: 8 }}>Students and independent learners</li>
            <li style={{ marginBottom: 8 }}>Educators and classrooms</li>
            <li>Anyone who enjoys watching and understanding space missions as they happen</li>
          </ul>
        </section>

        <section>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: '#fff',
              marginBottom: 16,
            }}
          >
            Guiding Principles
          </h2>
          <ul style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 1.8, margin: 0, padding: '0 0 0 24px' }}>
            <li style={{ marginBottom: 8 }}>Accuracy over speculation</li>
            <li style={{ marginBottom: 8 }}>Education without oversimplification</li>
            <li style={{ marginBottom: 8 }}>Open access</li>
            <li style={{ marginBottom: 8 }}>No ads</li>
            <li>No invasive tracking</li>
          </ul>
        </section>

        <section>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: '#fff',
              marginBottom: 16,
            }}
          >
            Looking Ahead
          </h2>
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 1.8 }}>
            <p style={{ marginBottom: 16 }}>
              StarKid Command is designed to grow carefully and intentionally.
            </p>
            <p>
              Future work may include additional missions, improved live event coverage, and expanded educational tools — always with an emphasis on public access and trust.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
