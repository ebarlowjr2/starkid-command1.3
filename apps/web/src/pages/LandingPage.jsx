import { useNavigate } from "react-router-dom"
import { TelemetryStrip } from "../components/TelemetryStrip.jsx"
import { FeaturedEventOrb } from "../components/FeaturedEventOrb.jsx"
import UpcomingEventsBanner from "../components/UpcomingEventsBanner.jsx"

export default function LandingPage() {
  const nav = useNavigate()

  return (
    <div
      className="landing-page-bg"
      style={{
        backgroundImage: "url('/assets/backgrounds/starkid-home-hero-web.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="landing-hero-image">
        <div className="landing-hero-overlay">
          <div className="landing-hero">
            <div className="landing-hero-kicker">WELCOME TO</div>
            <div className="landing-hero-title">
              STARKID <span className="landing-hero-accent">COMMAND</span>
            </div>
            <div className="landing-hero-subtitle">Junior Science Officer Control Network</div>
            <div className="landing-hero-body">
              StarKid Command is a live mission-control interface for tracking, understanding, and exploring space — built for enthusiasts and learners alike.
            </div>
            <div style={{ marginTop: 18 }}>
              <button
                onClick={() => nav("/explore")}
                className="landing-hero-button"
              >
                EXPLORE →
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="landing-section">
        <FeaturedEventOrb />
      </div>

      <div className="landing-section">
        <UpcomingEventsBanner />
      </div>

      <div className="landing-section">
        <TelemetryStrip />
      </div>

      <style>{`
        .landing-page-bg {
          min-height: calc(100vh - 120px);
          padding: 0 18px 36px;
          background-repeat: no-repeat;
          position: relative;
        }

        .landing-page-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(4,8,20,0.35) 0%, rgba(4,8,20,0.75) 55%, rgba(4,8,20,0.92) 100%);
          z-index: 0;
          pointer-events: none;
        }

        .landing-page-bg > * {
          position: relative;
          z-index: 1;
        }

        .landing-hero-image {
          position: relative;
          min-height: 360px;
          border-radius: 22px;
          margin: 24px auto 0;
          max-width: 1200px;
          overflow: hidden;
          background: rgba(8, 12, 24, 0.35);
          border: 1px solid rgba(34, 211, 238, 0.28);
          box-shadow: 0 24px 60px rgba(0,0,0,0.45);
        }

        .landing-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(4,8,20,0.15) 0%, rgba(4,8,20,0.65) 60%, rgba(4,8,20,0.9) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 36px;
          text-align: center;
        }

        .landing-hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          max-width: 720px;
        }

        .landing-hero-kicker {
          font-size: 12px;
          letter-spacing: 0.35em;
          color: rgba(255,255,255,0.7);
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        }

        .landing-hero-title {
          font-size: 42px;
          font-weight: 800;
          color: #f8fafc;
          letter-spacing: 0.04em;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        }

        .landing-hero-accent {
          color: #22d3ee;
        }

        .landing-hero-subtitle {
          color: rgba(148, 163, 184, 0.85);
          font-size: 16px;
          font-weight: 600;
        }

        .landing-hero-body {
          opacity: 0.9;
          line-height: 1.6;
          font-size: 16px;
          color: rgba(226,232,240,0.82);
        }

        .landing-hero-button {
          padding: 12px 28px;
          border-radius: 14px;
          border: 2px solid rgba(34, 211, 238, 0.7);
          background: rgba(0,0,0,0.35);
          font-weight: 800;
          cursor: pointer;
          font-size: 14px;
          color: #22d3ee;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          box-shadow: 0 0 18px rgba(34, 211, 238, 0.45);
          transition: all 0.2s ease;
        }

        .landing-hero-button:hover {
          background: rgba(34, 211, 238, 0.2);
          box-shadow: 0 0 24px rgba(34, 211, 238, 0.6);
        }

        .landing-section {
          max-width: 1200px;
          margin: 22px auto 0;
          padding: 0 6px;
        }

        @media (max-width: 900px) {
          .landing-hero-image {
            min-height: 360px;
          }
          .landing-hero-title {
            font-size: 32px;
          }
          .landing-hero-subtitle {
            font-size: 14px;
          }
        }

        @media (max-width: 600px) {
          .landing-hero-image {
            min-height: 320px;
          }
          .landing-hero-title {
            font-size: 26px;
          }
          .landing-hero-overlay {
            padding: 24px 16px;
          }
        }
      `}</style>
    </div>
  )
}
