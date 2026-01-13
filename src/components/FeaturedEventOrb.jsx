import { useNavigate } from "react-router-dom";
import { FEATURED_EVENT } from "../config/featuredEvent.js";
import { useCountdown } from "../hooks/useCountdown.js";

function pad2(n) {
  return String(n).padStart(2, "0");
}

export function FeaturedEventOrb() {
  const nav = useNavigate();
  const cd = useCountdown(FEATURED_EVENT.targetIso);

  const label = cd.done ? "WINDOW OPEN" : "COUNTDOWN";
  const timeStr = cd.done
    ? "00:00:00"
    : `${pad2(cd.hours)}:${pad2(cd.minutes)}:${pad2(cd.seconds)}`;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "140px 1fr",
        gap: 18,
        alignItems: "center",
        padding: "18px",
        borderRadius: 18,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(6px)",
        cursor: "pointer",
      }}
      onClick={() => nav(FEATURED_EVENT.route)}
      role="button"
      aria-label="Open Artemis II page"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && nav(FEATURED_EVENT.route)}
    >
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: 999,
          background:
            "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(120,180,255,0.55) 35%, rgba(40,90,200,0.25) 60%, rgba(0,0,0,0) 70%)",
          boxShadow:
            "0 0 18px rgba(120,180,255,0.55), 0 0 42px rgba(80,140,255,0.35), 0 0 80px rgba(60,110,255,0.18)",
          border: "1px solid rgba(255,255,255,0.14)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: -40,
            background:
              "linear-gradient(120deg, rgba(255,255,255,0.0) 30%, rgba(255,255,255,0.10) 45%, rgba(255,255,255,0.0) 60%)",
            transform: "rotate(10deg)",
            animation: "skcOrbSheen 3.6s linear infinite",
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.12em",
            opacity: 0.7,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          }}
        >
          NEXT MAJOR EVENT
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "baseline" }}>
          <div style={{ fontSize: 22, fontWeight: 800 }}>
            {FEATURED_EVENT.title}
          </div>
          <div style={{ fontSize: 12, opacity: 0.7, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
            {FEATURED_EVENT.subtitle} • {FEATURED_EVENT.tzLabel}
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.12em", opacity: 0.65, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
              {label}
            </div>

            <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
              <div style={{ fontSize: 28, fontWeight: 900, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                {cd.days}d
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                {timeStr}
              </div>
            </div>
          </div>

          <div
            style={{
              marginLeft: "auto",
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.04)",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 12,
              letterSpacing: "0.08em",
            }}
          >
            OPEN BRIEF →
          </div>
        </div>

        {FEATURED_EVENT.sourceNote && (
          <div style={{ fontSize: 12, opacity: 0.6 }}>
            {FEATURED_EVENT.sourceNote}
          </div>
        )}
      </div>
    </div>
  );
}
