import { Dimensions } from "react-native";

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
const scaleFactor = bucket === "compact" ? 0.92 : bucket === "large" ? 1.08 : 1;
const navScaleFactor = bucket === "compact" ? 0.9 : 1;

const s = (size: number) => Math.round(size * scaleFactor);
const sNav = (size: number) => Math.round(size * navScaleFactor);
const lh = (size: number, ratio: number) => Math.round(size * ratio * scaleFactor);

const baseFont = "Audiowide_400Regular";

export const typographyVariants: Record<TypographyVariant, VariantStyle> = {
  hero: { fontSize: s(34), lineHeight: lh(34, 1.2), fontWeight: "900", letterSpacing: 0.6, fontFamily: baseFont, allowFontScaling: false },
  heroKicker: { fontSize: s(12), lineHeight: lh(12, 1.4), fontWeight: "700", letterSpacing: 2, fontFamily: baseFont, allowFontScaling: false },
  title: { fontSize: s(28), lineHeight: lh(28, 1.2), fontWeight: "800", letterSpacing: 0.3, fontFamily: baseFont, allowFontScaling: false },
  h2: { fontSize: s(18), lineHeight: lh(18, 1.25), fontWeight: "800", letterSpacing: 0.4, fontFamily: baseFont, allowFontScaling: false },
  sectionLabel: { fontSize: s(11), lineHeight: lh(11, 1.4), fontWeight: "700", letterSpacing: 1, fontFamily: baseFont, allowFontScaling: false },
  body: { fontSize: s(14), lineHeight: lh(14, 1.4), fontWeight: "500", fontFamily: baseFont, allowFontScaling: true },
  bodySmall: { fontSize: s(12), lineHeight: lh(12, 1.4), fontWeight: "500", fontFamily: baseFont, allowFontScaling: true },
  caption: { fontSize: s(11), lineHeight: lh(11, 1.4), fontWeight: "500", fontFamily: baseFont, allowFontScaling: true },
  button: { fontSize: s(12), lineHeight: lh(12, 1.2), fontWeight: "700", letterSpacing: 1, fontFamily: baseFont, allowFontScaling: false },
  navLabel: { fontSize: sNav(8), lineHeight: sNav(10), fontWeight: "700", letterSpacing: 0.6, fontFamily: baseFont, allowFontScaling: false },
  cardTitle: { fontSize: s(16), lineHeight: lh(16, 1.25), fontWeight: "700", fontFamily: baseFont, allowFontScaling: false },
  cardMeta: { fontSize: s(12), lineHeight: lh(12, 1.4), fontWeight: "600", fontFamily: baseFont, allowFontScaling: true },
};

export function getTypography(variant: TypographyVariant) {
  return typographyVariants[variant];
}
