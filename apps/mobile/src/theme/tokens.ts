export const colors = {
  bg0: "#050812",
  bg1: "#070A1A",
  bg2: "#0B0F2A",
  panel: "rgba(10, 18, 40, 0.55)",
  panel2: "rgba(10, 18, 40, 0.35)",
  stroke: "rgba(95, 210, 255, 0.25)",
  stroke2: "rgba(255, 92, 214, 0.22)",
  text: "#EAF2FF",
  muted: "rgba(234, 242, 255, 0.75)",
  dim: "rgba(234, 242, 255, 0.55)",
  accent: "#3DEBFF",
  cyan: "#3DEBFF",
  magenta: "#FF4FD8",
  yellow: "#FFD166",
  green: "#45FF9A",
};

export const radii = {
  card: 18,
  pill: 999,
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  xxl: 28,
};

const baseFont = "Audiowide_400Regular";

export const typography = {
  title: { fontSize: 28, lineHeight: 32, fontWeight: "800" as const, letterSpacing: 0.3, fontFamily: baseFont },
  hero: { fontSize: 34, lineHeight: 38, fontWeight: "900" as const, letterSpacing: 0.6, fontFamily: baseFont },
  h2: { fontSize: 18, lineHeight: 22, fontWeight: "800" as const, letterSpacing: 0.4, fontFamily: baseFont },
  body: { fontSize: 14, lineHeight: 20, fontWeight: "500" as const, fontFamily: baseFont },
  small: { fontSize: 12, lineHeight: 16, fontWeight: "600" as const, letterSpacing: 0.4, fontFamily: baseFont },
  pixel: { fontSize: 11, lineHeight: 14, fontWeight: "700" as const, letterSpacing: 1.0, fontFamily: "PressStart2P_400Regular" },
};
