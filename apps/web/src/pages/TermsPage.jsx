import { useNavigate } from 'react-router-dom'

export default function TermsPage() {
  const navigate = useNavigate()
  const effectiveDate = 'May 15, 2026'

  const Section = ({ title, children }) => (
    <section style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 10 }}>
        {title}
      </h2>
      <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.8 }}>
        {children}
      </div>
    </section>
  )

  return (
    <div className="p-4" style={{ maxWidth: 900, margin: '0 auto' }}>
      <button
        onClick={() => navigate('/')}
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
          marginBottom: 22,
        }}
      >
        Back to Home
      </button>

      <h1
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: '#fff',
          marginBottom: 6,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          letterSpacing: 1,
        }}
      >
        Terms of Service
      </h1>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 26, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
        Effective Date: {effectiveDate}
      </div>

      <div style={{ padding: 18, borderRadius: 12, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(34, 211, 238, 0.2)' }}>
        <Section title="0. Organization">
          <p style={{ margin: 0 }}>
            StarKid Command is operated by the <strong>Barlow Foundation</strong>, a registered <strong>501(c)(3)</strong> nonprofit organization. The app was developed by <strong>One Circle Solutions, LLC</strong> for the Barlow Foundation.
          </p>
        </Section>

        <Section title="1. Acceptance of Terms">
          <p style={{ margin: 0 }}>
            By using StarKid Command, users agree to these terms.
          </p>
        </Section>

        <Section title="2. Educational Use">
          <p style={{ margin: 0 }}>
            StarKid Command provides educational content, learning activities, mission simulations, and space-related information.
          </p>
        </Section>

        <Section title="3. Not Official Mission Guidance">
          <p style={{ margin: 0 }}>
            StarKid Command is for education and entertainment. It does not provide official spaceflight, emergency, scientific, engineering, or operational guidance.
          </p>
        </Section>

        <Section title="4. User Accounts">
          <p style={{ margin: 0 }}>
            Users are responsible for maintaining access to their account and for appropriate use of the platform.
          </p>
        </Section>

        <Section title="5. User Submissions">
          <p style={{ margin: 0 }}>
            Learning answers, module submissions, and progress data may be stored to provide feedback, progress tracking, and future rewards.
          </p>
        </Section>

        <Section title="6. Acceptable Use">
          <p style={{ margin: 0 }}>
            Users may not misuse the platform, attempt unauthorized access, abuse services, submit harmful content, or interfere with the app.
          </p>
        </Section>

        <Section title="7. Third-Party Data and Links">
          <p style={{ margin: 0 }}>
            The app may reference third-party data sources or link to external resources. StarKid Command is not responsible for third-party content.
          </p>
        </Section>

        <Section title="8. Changes to the Service">
          <p style={{ margin: 0 }}>
            Features may change as the platform evolves.
          </p>
        </Section>

        <Section title="9. Contact">
          <p style={{ margin: 0 }}>
            For questions, contact: <span style={{ color: '#22d3ee' }}>info@onecs.net</span>
          </p>
        </Section>
      </div>
    </div>
  )
}
