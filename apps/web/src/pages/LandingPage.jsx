import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { getArtemisProgramSummary, getArtemisPriorityAlert } from "@starkid/core"
import { TelemetryStrip } from "../components/TelemetryStrip.jsx"
import { FeaturedEventOrb } from "../components/FeaturedEventOrb.jsx"
import UpcomingEventsBanner from "../components/UpcomingEventsBanner.jsx"

export default function LandingPage() {
  const nav = useNavigate()
  const [artemis, setArtemis] = useState(null)
  const [now, setNow] = useState(Date.now())
  const fallbackArtemisDate = "2026-04-01T00:00:00Z"

  useEffect(() => {
    let active = true
    async function load() {
      const [summaryResult, alertResult] = await Promise.allSettled([
        getArtemisProgramSummary(),
        getArtemisPriorityAlert(),
      ])
      if (!active) return
      const summary = summaryResult.status === "fulfilled" ? summaryResult.value?.data : null
      const alert = alertResult.status === "fulfilled" ? alertResult.value?.data : null
      const nextMissionDate = summary?.nextMissionDate || alert?.startTime || null
      setArtemis(
        summary
          ? { ...summary, nextMissionDate }
          : alert
            ? {
                programName: "Artemis",
                description: alert.description,
                nextMission: alert.title,
                nextMissionDate,
                sourceUrl: alert.sourceUrl,
                missionUrl: alert.sourceUrl,
                programTag: "Artemis",
              }
            : null
      )
    }
    load()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const artemisCountdown = (() => {
    const targetIso = artemis?.nextMissionDate || fallbackArtemisDate
    const target = new Date(targetIso).getTime()
    if (!Number.isFinite(target)) return "TBD"
    const diff = Math.max(0, target - now)
    const days = Math.floor(diff / (24 * 3600 * 1000))
    const hours = Math.floor((diff % (24 * 3600 * 1000)) / (3600 * 1000))
    const minutes = Math.floor((diff % (3600 * 1000)) / (60 * 1000))
    const seconds = Math.floor((diff % (60 * 1000)) / 1000)
    return `${days}d ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  })()

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
        <div
          className="artemis-card"
          onClick={() => nav("/artemis")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && nav("/artemis")}
        >
          <div className="artemis-label">ARTEMIS SPOTLIGHT</div>
          <div className="artemis-title">{artemis?.nextMission || "Artemis II"}</div>
          <div className="artemis-countdown">
            COUNTDOWN · <span>{artemisCountdown}</span>
          </div>
          <div className="artemis-body">
            {artemis?.description || "NASA’s priority lunar exploration program."}
          </div>
          <div className="artemis-cta">OPEN ARTEMIS →</div>
        </div>
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

        .artemis-card {
          padding: 18px;
          border-radius: 16px;
          border: 1px solid rgba(34, 211, 238, 0.35);
          background: rgba(8, 12, 24, 0.55);
          cursor: pointer;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }

        .artemis-card:hover {
          transform: translateY(-2px);
          border-color: rgba(34, 211, 238, 0.6);
        }

        .artemis-label {
          font-size: 10px;
          letter-spacing: 0.2em;
          color: rgba(255,255,255,0.6);
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        }

        .artemis-title {
          font-size: 20px;
          font-weight: 700;
          color: #22d3ee;
          margin-top: 8px;
        }

        .artemis-body {
          font-size: 14px;
          color: rgba(226,232,240,0.8);
          margin-top: 6px;
        }

        .artemis-countdown {
          margin-top: 8px;
          font-size: 12px;
          letter-spacing: 0.12em;
          color: rgba(148, 163, 184, 0.9);
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        }

        .artemis-countdown span {
          color: #22d3ee;
          font-weight: 700;
        }

        .artemis-cta {
          margin-top: 12px;
          font-size: 11px;
          letter-spacing: 0.14em;
          color: rgba(34,211,238,0.8);
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
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
