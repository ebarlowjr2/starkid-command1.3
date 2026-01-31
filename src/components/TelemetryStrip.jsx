import { TELEMETRY } from "../config/telemetry.js"

export function TelemetryStrip() {
  const items = [
    { label: "MISSIONS LAUNCHED", value: TELEMETRY.missionsLaunched.toLocaleString() },
    { label: "SECTORS EXPLORED", value: TELEMETRY.sectorsExplored },
    { label: "SYSTEMS ONLINE", value: TELEMETRY.systemsOnline },
    { label: "SIGNAL STATUS", value: TELEMETRY.signalStatus },
  ]

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: 16,
        padding: "16px 18px",
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(6px)",
      }}
    >
      {items.map((item) => (
        <div
          key={item.label}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.12em",
              opacity: 0.65,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            }}
          >
            {item.label}
          </div>

          <div
            style={{
              fontSize: 20,
              fontWeight: 800,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            }}
          >
            {item.value}
          </div>
        </div>
      ))}
    </div>
  )
}
