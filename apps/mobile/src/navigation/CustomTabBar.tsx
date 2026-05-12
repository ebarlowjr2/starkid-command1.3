import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { colors } from "../theme/tokens";
import { CometTabButton } from "./CometTabButton";
import { CustomText } from "../components/ui/CustomText";

const ICONS: Record<string, string> = {
  Home: "🏠",
  Explore: "🧭",
  "Command Center": "📡",
  // Reused route name for the Missions hub tab (keeps route manifest stable).
  "Lunar Events": "🎯",
  Learning: "🧪",
  Profile: "👤",
  "C.O.M.E.T.": "✨",
};

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const routes = state.routes;

  return (
    <View style={styles.container}>
      {routes.map((route, index) => {
        const focused = state.index === index;
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel ?? options.title ?? route.name;
        const icon = ICONS[route.name] || "•";

        const onPress = () => {
          const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        if (route.name === "C.O.M.E.T.") {
          return (
            <View key={route.key} style={styles.tab}>
              <CometTabButton onPress={onPress} focused={focused} />
            </View>
          );
        }

        return (
          <Pressable key={route.key} onPress={onPress} style={styles.tab}>
            <CustomText style={[styles.icon, focused && styles.iconActive]} allowFontScaling={false}>
              {icon}
            </CustomText>
            <CustomText
              variant="navLabel"
              style={[styles.label, focused && styles.labelActive]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {String(label)}
            </CustomText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    backgroundColor: "rgba(8, 12, 24, 0.9)",
    borderTopWidth: 1,
    borderColor: "rgba(61,235,255,0.2)",
    overflow: "visible",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  label: { color: colors.dim },
  labelActive: { color: colors.cyan },
  icon: { fontSize: 18, color: colors.dim },
  iconActive: { color: colors.cyan },
});
