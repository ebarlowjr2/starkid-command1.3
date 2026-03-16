export default function CyberLabPage() {
  return (
    <div className="learning-page">
      <div className="learning-hero">
        <div className="learning-kicker">CYBER LAB</div>
        <div className="learning-title">Cybersecurity Training Environment</div>
        <div className="learning-subtitle">
          Interactive cybersecurity training inspired by real space mission systems.
        </div>
      </div>

      <div className="learning-card" style={{ marginTop: 22 }}>
        <div className="learning-card-title">Coming Soon</div>
        <div className="learning-card-body">
          This page will connect to cyber challenges, incident response labs, and log analysis drills.
        </div>
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
          font-size: 26px;
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

        .learning-card {
          padding: 18px;
          border-radius: 16px;
          border: 1px solid rgba(34,211,238,0.35);
          background: rgba(8,12,24,0.5);
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
      `}</style>
    </div>
  )
}
