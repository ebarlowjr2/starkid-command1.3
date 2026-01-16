export function PlanetModelViewer({ modelSrc, alt, height = 320, poster }) {
  return (
    <div
      style={{
        height,
        width: "100%",
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(0,0,0,0.35)",
      }}
    >
      <model-viewer
        src={modelSrc}
        alt={alt}
        autoplay
        auto-rotate
        camera-controls
        rotation-per-second="12deg"
        shadow-intensity="0.35"
        exposure="1.0"
        poster={poster}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </div>
  )
}
