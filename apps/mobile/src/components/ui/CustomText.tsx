import React from "react";
import { Text, TextProps, TextStyle } from "react-native";
import type { TypographyVariant } from "../../theme/typography";
import { getTypography } from "../../theme/typography";

type Props = TextProps & {
  variant?: TypographyVariant;
};

export function CustomText({ variant, style, allowFontScaling, ...rest }: Props) {
  const variantStyle = variant ? getTypography(variant) : undefined;
  const { allowFontScaling: variantScaling, ...textStyle } =
    (variantStyle || {}) as TextStyle & { allowFontScaling?: boolean };
  const resolvedScaling = allowFontScaling ?? variantScaling;

  return (
    <Text
      {...rest}
      allowFontScaling={resolvedScaling}
      style={[textStyle, style]}
    />
  );
}
