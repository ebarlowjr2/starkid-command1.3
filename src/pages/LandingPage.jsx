import { useNavigate } from "react-router-dom"
import NebulaHero from "../components/hero/NebulaHero.jsx"

export default function LandingPage() {
  const nav = useNavigate()

  return (
    <div
      className="landing-page-bg"
      style={{
        minHeight: "calc(100vh - 120px)",
        padding: "28px 18px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        className="landing-grid"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1.05fr 1fr",
          gap: 22,
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div 
            style={{ 
              fontSize: 52, 
              fontWeight: 800, 
              lineHeight: 1.05,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              letterSpacing: "-0.02em",
            }}
          >
            WELCOME TO <br /> 
            <span style={{ color: "#22d3ee" }}>STARKID</span> COMMAND
          </div>
          <div 
            style={{ 
              opacity: 0.85, 
              maxWidth: 520, 
              lineHeight: 1.6,
              fontSize: 18,
              color: "rgba(255,255,255,0.8)",
            }}
          >
            Explore the solar system, missions, rockets, and beyond — built like a command console.
          </div>

          <div style={{ marginTop: 18 }}>
            <button
              onClick={() => nav("/explore")}
              style={{
                padding: "14px 24px",
                borderRadius: 12,
                border: "1px solid rgba(34, 211, 238, 0.4)",
                background: "rgba(34, 211, 238, 0.15)",
                fontWeight: 800,
                cursor: "pointer",
                fontSize: 16,
                color: "#22d3ee",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e) => {
                e.target.style.background = "rgba(34, 211, 238, 0.25)"
                e.target.style.borderColor = "rgba(34, 211, 238, 0.6)"
              }}
              onMouseOut={(e) => {
                e.target.style.background = "rgba(34, 211, 238, 0.15)"
                e.target.style.borderColor = "rgba(34, 211, 238, 0.4)"
              }}
            >
              EXPLORE →
            </button>
          </div>

          <div 
            style={{ 
              marginTop: 32,
              display: "flex",
              gap: 24,
              opacity: 0.6,
              fontSize: 12,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            }}
          >
            <div>
              <div style={{ color: "#22d3ee", marginBottom: 4 }}>SYSTEMS</div>
              <div>ONLINE</div>
            </div>
            <div>
              <div style={{ color: "#22d3ee", marginBottom: 4 }}>MISSIONS</div>
              <div>8 ACTIVE</div>
            </div>
            <div>
              <div style={{ color: "#22d3ee", marginBottom: 4 }}>DATA</div>
              <div>LIVE</div>
            </div>
          </div>
        </div>

        <div className="nebula-container" style={{ height: 520 }}>
          <NebulaHero />
        </div>
      </div>

            <style>{`
              .landing-page-bg {
                background: 
                  radial-gradient(ellipse at 20% 80%, rgba(30, 64, 175, 0.15) 0%, transparent 50%),
                  radial-gradient(ellipse at 80% 20%, rgba(88, 28, 135, 0.12) 0%, transparent 50%),
                  radial-gradient(ellipse at 50% 50%, rgba(6, 182, 212, 0.08) 0%, transparent 60%),
                  linear-gradient(to bottom, #000000 0%, #0a0a1a 50%, #000000 100%);
              }
        
              .landing-page-bg::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-image: 
                  radial-gradient(1px 1px at 10% 10%, rgba(255,255,255,0.8) 0%, transparent 100%),
                  radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.6) 0%, transparent 100%),
                  radial-gradient(1px 1px at 35% 15%, rgba(255,255,255,0.9) 0%, transparent 100%),
                  radial-gradient(1px 1px at 45% 45%, rgba(255,255,255,0.5) 0%, transparent 100%),
                  radial-gradient(1px 1px at 55% 25%, rgba(255,255,255,0.7) 0%, transparent 100%),
                  radial-gradient(1px 1px at 65% 55%, rgba(255,255,255,0.6) 0%, transparent 100%),
                  radial-gradient(1px 1px at 75% 35%, rgba(255,255,255,0.8) 0%, transparent 100%),
                  radial-gradient(1px 1px at 85% 65%, rgba(255,255,255,0.5) 0%, transparent 100%),
                  radial-gradient(1px 1px at 95% 20%, rgba(255,255,255,0.7) 0%, transparent 100%),
                  radial-gradient(1px 1px at 5% 50%, rgba(255,255,255,0.6) 0%, transparent 100%),
                  radial-gradient(1px 1px at 15% 70%, rgba(255,255,255,0.8) 0%, transparent 100%),
                  radial-gradient(1px 1px at 25% 85%, rgba(255,255,255,0.5) 0%, transparent 100%),
                  radial-gradient(1px 1px at 40% 75%, rgba(255,255,255,0.7) 0%, transparent 100%),
                  radial-gradient(1px 1px at 50% 90%, rgba(255,255,255,0.6) 0%, transparent 100%),
                  radial-gradient(1px 1px at 60% 80%, rgba(255,255,255,0.8) 0%, transparent 100%),
                  radial-gradient(1px 1px at 70% 95%, rgba(255,255,255,0.5) 0%, transparent 100%),
                  radial-gradient(1px 1px at 80% 5%, rgba(255,255,255,0.9) 0%, transparent 100%),
                  radial-gradient(1px 1px at 90% 40%, rgba(255,255,255,0.6) 0%, transparent 100%),
                  radial-gradient(2px 2px at 12% 22%, rgba(255,255,255,0.4) 0%, transparent 100%),
                  radial-gradient(2px 2px at 32% 62%, rgba(255,255,255,0.3) 0%, transparent 100%),
                  radial-gradient(2px 2px at 52% 12%, rgba(255,255,255,0.5) 0%, transparent 100%),
                  radial-gradient(2px 2px at 72% 72%, rgba(255,255,255,0.4) 0%, transparent 100%),
                  radial-gradient(2px 2px at 92% 52%, rgba(255,255,255,0.3) 0%, transparent 100%),
                  radial-gradient(1.5px 1.5px at 8% 88%, rgba(200,220,255,0.6) 0%, transparent 100%),
                  radial-gradient(1.5px 1.5px at 28% 38%, rgba(255,200,200,0.5) 0%, transparent 100%),
                  radial-gradient(1.5px 1.5px at 48% 58%, rgba(200,255,220,0.4) 0%, transparent 100%),
                  radial-gradient(1.5px 1.5px at 68% 18%, rgba(255,255,200,0.5) 0%, transparent 100%),
                  radial-gradient(1.5px 1.5px at 88% 78%, rgba(220,200,255,0.6) 0%, transparent 100%);
                pointer-events: none;
                z-index: 0;
              }
        
              .landing-page-bg > * {
                position: relative;
                z-index: 1;
              }
        
              @media (max-width: 900px) {
                .landing-grid {
                  grid-template-columns: 1fr !important;
                  text-align: center;
                }
                .landing-grid > div:first-child {
                  align-items: center;
                }
                .nebula-container {
                  height: 380px !important;
                }
              }
            `}</style>
    </div>
  )
}
