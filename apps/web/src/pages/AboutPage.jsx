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
        About StarKid Command
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
            Who Built It
          </h2>
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 1.8 }}>
            <p style={{ marginBottom: 16 }}>
              StarKid Command was developed by <strong>One Circle Solutions, LLC</strong> for the <strong>Barlow Foundation</strong>.
            </p>
            <p style={{ margin: 0 }}>
              The Barlow Foundation is a registered <strong>501(c)(3)</strong> nonprofit organization.
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
            What Is StarKid Command?
          </h2>
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 1.8 }}>
            <p style={{ marginBottom: 16 }}>
              StarKid Command is a space-inspired learning and mission platform that turns real-world space events into interactive STEM activities.
            </p>
            <p>
              The platform helps learners explore launches, sky events, space weather, mission alerts, and guided educational modules through a command-center style experience.
            </p>
            <p style={{ marginTop: 16 }}>
              StarKid Command is designed to make space science, math, technology, and future-ready skills more accessible through interactive missions, progress tracking, and learning modules.
            </p>
            <p style={{ marginTop: 16, marginBottom: 0, color: 'rgba(255,255,255,0.65)' }}>
              StarKid Command is an educational platform and is not an official NASA product.
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
              StarKid Command brings those pieces together in a format that feels like a real operations console, allowing enthusiasts and learners to explore missions, vehicles, and events with context and clarity — then practice through guided learning modules.
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
