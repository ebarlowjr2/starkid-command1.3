import { useNavigate } from "react-router-dom"
import NebulaHero from "../components/hero/NebulaHero.jsx"

export default function LandingPage() {
  const nav = useNavigate()

  return (
    <div
      style={{
        minHeight: "calc(100vh - 120px)",
        padding: "28px 18px",
        background: "radial-gradient(1200px 600px at 70% 50%, rgba(255,255,255,0.06), transparent 55%), #000",
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
