import { Dimensions, Platform } from "react-native";

export type TypographyVariant =
  | "hero"
  | "heroKicker"
  | "title"
  | "h2"
  | "sectionLabel"
  | "body"
  | "bodySmall"
  | "caption"
  | "button"
  | "navLabel"
  | "cardTitle"
  | "cardMeta";

type VariantStyle = {
  fontSize: number;
  lineHeight: number;
  fontWeight?: "400" | "500" | "600" | "700" | "800" | "900";
  letterSpacing?: number;
  fontFamily?: string;
  allowFontScaling?: boolean;
};

const { width } = Dimensions.get("window");

const bucket = width < 360 ? "compact" : width >= 414 ? "large" : "standard";
// Keep command UI stable across current iPhone sizes. Accessibility-aware body
// variants retain font scaling instead of inflating every interface label.
const scaleFactor = bucket === "compact" ? 0.94 : 1;
const navScaleFactor = bucket === "compact" ? 0.9 : 1;

const s = (size: number) => Math.round(size * scaleFactor);
const sNav = (size: number) => Math.round(size * navScaleFactor);
const lh = (size: number, ratio: number) => Math.round(size * ratio * scaleFactor);

const displayFont = "Audiowide_400Regular";
const bodyFont = Platform.select({ ios: "Avenir Next", android: "sans-serif", default: "System" });

export const typographyVariants: Record<TypographyVariant, VariantStyle> = {
  hero: { fontSize: s(34), lineHeight: lh(34, 1.2), fontWeight: "900", letterSpacing: 0.6, fontFamily: displayFont, allowFontScaling: false },
  heroKicker: { fontSize: s(12), lineHeight: lh(12, 1.4), fontWeight: "700", letterSpacing: 2, fontFamily: displayFont, allowFontScaling: false },
  title: { fontSize: s(28), lineHeight: lh(28, 1.2), fontWeight: "800", letterSpacing: 0.3, fontFamily: displayFont, allowFontScaling: false },
  h2: { fontSize: s(18), lineHeight: lh(18, 1.25), fontWeight: "800", letterSpacing: 0.4, fontFamily: displayFont, allowFontScaling: false },
  sectionLabel: { fontSize: s(11), lineHeight: lh(11, 1.4), fontWeight: "700", letterSpacing: 1, fontFamily: displayFont, allowFontScaling: false },
  body: { fontSize: s(14), lineHeight: lh(14, 1.45), fontWeight: "500", fontFamily: bodyFont, allowFontScaling: true },
  bodySmall: { fontSize: s(12), lineHeight: lh(12, 1.45), fontWeight: "500", fontFamily: bodyFont, allowFontScaling: true },
  caption: { fontSize: s(11), lineHeight: lh(11, 1.45), fontWeight: "500", fontFamily: bodyFont, allowFontScaling: true },
  button: { fontSize: s(12), lineHeight: lh(12, 1.2), fontWeight: "700", letterSpacing: 1, fontFamily: displayFont, allowFontScaling: false },
  navLabel: { fontSize: sNav(8), lineHeight: sNav(10), fontWeight: "700", letterSpacing: 0.6, fontFamily: displayFont, allowFontScaling: false },
  cardTitle: { fontSize: s(16), lineHeight: lh(16, 1.25), fontWeight: "700", fontFamily: displayFont, allowFontScaling: false },
  cardMeta: { fontSize: s(12), lineHeight: lh(12, 1.45), fontWeight: "600", fontFamily: bodyFont, allowFontScaling: true },
};

export function getTypography(variant: TypographyVariant) {
  return typographyVariants[variant];
}
