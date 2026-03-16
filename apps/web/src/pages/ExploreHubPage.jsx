import { useNavigate } from "react-router-dom"
import { FEATURES, getStatusLabel, getStatusColor } from "../config/features.js"

function FeatureCard({ feature, onNavigate }) {
  const statusLabel = getStatusLabel(feature.status)
  const statusColor = getStatusColor(feature.status)
  const isDisabled = feature.status === "coming_soon"

  return (
    <div
      className="feature-card"
      style={{
        display: "grid",
        gridTemplateColumns: "140px 1fr",
        gap: 16,
        padding: 16,
        borderRadius: 16,
        border: `1px solid ${feature.color}33`,
        background: "rgba(0,0,0,0.4)",
        opacity: isDisabled ? 0.6 : 1,
        transition: "all 0.2s ease",
      }}
    >
      <div
        style={{
          width: 140,
          height: 100,
          borderRadius: 12,
          overflow: "hidden",
          background: `linear-gradient(135deg, ${feature.color}22, ${feature.color}08)`,
          border: `1px solid ${feature.color}22`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize: 36,
            opacity: 0.6,
          }}
        >
          {feature.id === "command-center" && "🎛️"}
          {feature.id === "solar-map" && "🌌"}
          {feature.id === "planets" && "🪐"}
          {feature.id === "rockets" && "🚀"}
          {feature.id === "artemis" && "🌙"}
          {feature.id === "beyond" && "✨"}
          {feature.id === "sky-events" && "🌠"}
          {feature.id === "tonights-mission" && "🔭"}
          {feature.id === "comets" && "☄️"}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: feature.color,
            }}
          >
            {feature.title}
          </div>
          <div
            style={{
              fontSize: 10,
              padding: "2px 6px",
              borderRadius: 4,
              background: `${statusColor}22`,
              color: statusColor,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontWeight: 600,
            }}
          >
            {statusLabel}
          </div>
        </div>

        <div
          style={{
            fontSize: 14,
            opacity: 0.8,
            lineHeight: 1.5,
            color: "rgba(255,255,255,0.75)",
          }}
        >
          {feature.description}
        </div>

        <div style={{ marginTop: "auto" }}>
          <button
            onClick={() => !isDisabled && onNavigate(feature.route)}
            disabled={isDisabled}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: `1px solid ${feature.color}44`,
              background: isDisabled ? "rgba(255,255,255,0.05)" : `${feature.color}22`,
              cursor: isDisabled ? "not-allowed" : "pointer",
              fontWeight: 700,
              fontSize: 12,
              color: isDisabled ? "rgba(255,255,255,0.4)" : feature.color,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              transition: "all 0.2s ease",
            }}
          >
            {isDisabled ? "COMING SOON" : "GO →"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ExploreHubPage() {
  const nav = useNavigate()

  return (
    <div className="explore-page-bg">
      <div className="explore-hero">
        <div className="explore-hero-overlay">
          <div>
            <div className="explore-hero-kicker">EXPLORE HUB</div>
            <div className="explore-hero-title">Choose a console to jump into and start tracking missions.</div>
          </div>
        </div>
      </div>

      <div className="explore-content">
        <div
          onClick={() => nav('/missions/artemis')}
          className="explore-featured"
        >
          <div className="explore-featured-badge">FEATURED EXPERIENCE</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 32 }}>🌙</span>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#22d3ee', marginBottom: 4 }}>Artemis Program</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>Track NASA's return to the Moon — mission control dashboard with live status, crew info, and hardware specs.</div>
            </div>
            <div style={{ marginLeft: 'auto', fontSize: 24, color: '#22d3ee' }}>→</div>
          </div>
        </div>

          <div
        className="features-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
          gap: 16,
        }}
      >
        <div
          className="feature-card"
          onClick={() => nav('/stem-activities')}
          style={{
            display: "grid",
            gridTemplateColumns: "140px 1fr",
            gap: 16,
            padding: 16,
            borderRadius: 16,
            border: "1px solid rgba(34, 211, 238, 0.45)",
            background: "linear-gradient(135deg, rgba(34, 211, 238, 0.12), rgba(168, 85, 247, 0.08))",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <div
            style={{
              width: 140,
              height: 100,
              borderRadius: 12,
              overflow: "hidden",
              background: "linear-gradient(135deg, rgba(34, 211, 238, 0.25), rgba(168, 85, 247, 0.1))",
              border: "1px solid rgba(34, 211, 238, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ fontSize: 36, opacity: 0.8 }}>🧪</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#22d3ee" }}>
                STEM Activities
              </div>
              <div
                style={{
                  fontSize: 10,
                  padding: "2px 6px",
                  borderRadius: 4,
                  background: "rgba(34, 211, 238, 0.2)",
                  color: "#22d3ee",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  fontWeight: 600,
                }}
              >
                COMING SOON
              </div>
            </div>
            <div style={{ fontSize: 14, opacity: 0.8, lineHeight: 1.5, color: "rgba(255,255,255,0.75)" }}>
              Classroom-ready challenges and mini-labs tied to live mission data.
            </div>
            <div style={{ marginTop: "auto" }}>
              <button
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "1px solid rgba(34, 211, 238, 0.4)",
                  background: "rgba(34, 211, 238, 0.12)",
                  fontWeight: 700,
                  fontSize: 12,
                  color: "#22d3ee",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  cursor: "pointer",
                }}
              >
                VIEW →
              </button>
            </div>
          </div>
        </div>
        {FEATURES.map((feature) => (
          <FeatureCard
            key={feature.id}
            feature={feature}
            onNavigate={(route) => nav(route)}
          />
        ))}
      </div>

      </div>

      <style>{`
        .explore-page-bg {
          min-height: calc(100vh - 120px);
          padding: 0 18px 36px;
          background-image: url('/assets/backgrounds/starkid-explore-hero-web.png');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          background-repeat: no-repeat;
        }

        .explore-page-bg::before {
          content: '';
          position: fixed;
          inset: 0;
          background: linear-gradient(180deg, rgba(4,8,20,0.35) 0%, rgba(4,8,20,0.75) 55%, rgba(4,8,20,0.92) 100%);
          z-index: 0;
          pointer-events: none;
        }

        .explore-page-bg > * {
          position: relative;
          z-index: 1;
        }

        .explore-hero {
          position: relative;
          min-height: 240px;
          border-radius: 22px;
          margin: 24px auto 0;
          max-width: 1200px;
          overflow: hidden;
          background: rgba(8, 12, 24, 0.6);
          border: 1px solid rgba(34, 211, 238, 0.28);
          box-shadow: 0 20px 50px rgba(0,0,0,0.45);
        }

        .explore-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(4,8,20,0.25) 0%, rgba(4,8,20,0.6) 55%, rgba(4,8,20,0.85) 100%);
          display: flex;
          align-items: flex-end;
          padding: 24px;
        }

        .explore-hero-kicker {
          font-size: 12px;
          letter-spacing: 0.32em;
          color: rgba(255,255,255,0.7);
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          margin-bottom: 8px;
        }

        .explore-hero-title {
          font-size: 20px;
          font-weight: 700;
          color: #e2e8f0;
          max-width: 680px;
        }

        .explore-content {
          max-width: 1200px;
          margin: 22px auto 0;
          padding: 0 6px;
        }

        .explore-featured {
          margin-bottom: 24px;
          padding: 20px;
          border-radius: 16px;
          background: linear-gradient(135deg, rgba(34, 211, 238, 0.15), rgba(168, 85, 247, 0.1));
          border: 2px solid rgba(34, 211, 238, 0.4);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .explore-featured-badge {
          font-size: 10px;
          padding: 2px 8px;
          border-radius: 4px;
          background: rgba(34, 211, 238, 0.3);
          color: #22d3ee;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-weight: 700;
          display: inline-block;
          margin-bottom: 10px;
        }

        @media (max-width: 500px) {
          .features-grid {
            grid-template-columns: 1fr !important;
          }
          .feature-card {
            grid-template-columns: 1fr !important;
          }
          .explore-hero {
            min-height: 220px;
          }
          .explore-hero-title {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  )
}
