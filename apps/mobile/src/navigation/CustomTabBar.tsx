import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { colors } from "../theme/tokens";
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
  // C.O.M.E.T. is still available as an in-app destination, but it is a
  // coming-soon assistant. Keeping it out of the primary bar gives the six
  // active destinations enough room for stable, readable labels.
  const routes = state.routes.filter((route) => route.name !== "C.O.M.E.T.");

  return (
    <View style={styles.container}>
      {routes.map((route) => {
        const focused = state.routes[state.index]?.key === route.key;
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel ?? options.title ?? route.name;
        const icon = ICONS[route.name] || "•";

        const onPress = () => {
          const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

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
    paddingHorizontal: 10,
    paddingTop: 12,
    paddingBottom: 18,
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
