import { useNavigate } from 'react-router-dom'

export default function PrivacyPage() {
  const navigate = useNavigate()
  const effectiveDate = 'April 30, 2026'

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
        Privacy Policy
      </h1>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 26, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
        Effective Date: {effectiveDate}
      </div>

      <div style={{ padding: 18, borderRadius: 12, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(34, 211, 238, 0.2)' }}>
        <Section title="1. Information We Collect">
          <p style={{ margin: 0 }}>
            We may collect account information, learning progress, module submissions, usage data, and basic device/app information.
          </p>
        </Section>

        <Section title="2. How We Use Information">
          <p style={{ margin: 0 }}>
            We use information to provide the app experience, save learning progress, improve the platform, support user accounts, and maintain security.
          </p>
        </Section>

        <Section title="3. Learning Progress and Submissions">
          <p style={{ margin: 0 }}>
            When users complete learning modules, StarKid Command may store progress, answers, submissions, XP, and completion status.
          </p>
        </Section>

        <Section title="4. Third-Party Services">
          <p style={{ margin: 0 }}>
            StarKid Command may use services such as Supabase, Vercel, analytics tools, authentication providers, and external space/science data sources.
          </p>
        </Section>

        <Section title="5. Children’s Privacy">
          <p style={{ margin: 0 }}>
            StarKid Command is intended for educational use. If the app is used by children, parents or guardians should supervise account creation and use. We do not knowingly collect personal information from children without appropriate consent.
          </p>
        </Section>

        <Section title="6. Data Security">
          <p style={{ margin: 0 }}>
            We use reasonable technical and organizational safeguards to protect user information.
          </p>
        </Section>

        <Section title="7. Your Choices">
          <p style={{ margin: 0 }}>
            Users may request account or data deletion by contacting us.
          </p>
        </Section>

        <Section title="8. Contact">
          <p style={{ margin: 0 }}>
            For privacy questions, contact: <span style={{ color: '#22d3ee' }}>info@onecs.net</span>
          </p>
        </Section>
      </div>
    </div>
  )
}
