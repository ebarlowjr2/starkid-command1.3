import { useNavigate } from 'react-router-dom'

export default function LearningModuleAdminHubPage() {
  const nav = useNavigate()

  const cards = [
    {
      title: 'Add Learning Module',
      description: 'Create a new module draft with the official authoring template.',
      route: '/learning/admin/add',
    },
    {
      title: 'Module Review & Approval',
      description: 'Review draft modules, publish, or archive content.',
      route: '/learning/admin/approve',
    },
  ]

  return (
    <div className="learning-page">
      <div className="learning-hero">
        <div>
          <div className="learning-kicker">LEARNING ADMIN</div>
          <div className="learning-title">Module Command Console</div>
          <div className="learning-subtitle">
            Create modules and manage the approval workflow.
          </div>
        </div>
      </div>

      <div className="learning-grid">
        {cards.map((card) => (
          <div
            key={card.title}
            className="learning-card"
            onClick={() => nav(card.route)}
          >
            <div className="learning-card-title">{card.title}</div>
            <div className="learning-card-body">{card.description}</div>
            <div className="learning-card-cta">OPEN →</div>
          </div>
        ))}
      </div>

      <style>{`
        .learning-page {
          min-height: calc(100vh - 120px);
          padding: 24px 18px 36px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .learning-hero {
          padding: 22px;
          border-radius: 18px;
          border: 1px solid rgba(34,211,238,0.35);
          background: rgba(8,12,24,0.6);
          box-shadow: 0 18px 40px rgba(0,0,0,0.4);
        }

        .learning-kicker {
          font-size: 12px;
          letter-spacing: 0.32em;
          color: rgba(255,255,255,0.7);
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        }

        .learning-title {
          font-size: 28px;
          font-weight: 800;
          color: #e2e8f0;
          margin-top: 8px;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        }

        .learning-subtitle {
          color: rgba(148,163,184,0.85);
          margin-top: 8px;
          font-size: 14px;
        }

        .learning-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
          margin-top: 22px;
        }

        .learning-card {
          padding: 18px;
          border-radius: 16px;
          border: 1px solid rgba(34,211,238,0.35);
          background: rgba(8,12,24,0.5);
          cursor: pointer;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }

        .learning-card:hover {
          transform: translateY(-2px);
          border-color: rgba(34,211,238,0.6);
        }

        .learning-card-title {
          font-size: 16px;
          font-weight: 700;
          color: #22d3ee;
          margin-bottom: 6px;
        }

        .learning-card-body {
          font-size: 13px;
          color: rgba(226,232,240,0.75);
          line-height: 1.5;
        }

        .learning-card-cta {
          margin-top: 12px;
          font-size: 11px;
          letter-spacing: 0.18em;
          color: rgba(34,211,238,0.8);
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        }
      `}</style>
    </div>
  )
}
