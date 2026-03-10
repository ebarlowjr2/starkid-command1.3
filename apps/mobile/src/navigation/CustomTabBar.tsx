import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { colors, typography } from "../theme/tokens";
import { CometTabButton } from "./CometTabButton";

const ICONS: Record<string, string> = {
  Home: "home",
  Explore: "compass",
  "Command Center": "pulse",
  "Lunar Events": "moon",
  "STEM Activities": "flask",
  Profile: "person",
  "C.O.M.E.T.": "sparkles",
};

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const routes = state.routes;

  return (
    <View style={styles.container}>
      {routes.map((route, index) => {
        const focused = state.index === index;
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel ?? options.title ?? route.name;
        const iconName = ICONS[route.name] || "ellipse";

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
            <Ionicons
              name={iconName as any}
              size={20}
              color={focused ? colors.cyan : colors.dim}
            />
            <Text style={[styles.label, focused && styles.labelActive]}>{String(label)}</Text>
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
    paddingTop: 10,
    paddingBottom: 18,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    backgroundColor: "rgba(8, 12, 24, 0.9)",
    borderTopWidth: 1,
    borderColor: "rgba(61,235,255,0.2)",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  label: { ...typography.pixel, color: colors.dim, fontSize: 9 },
  labelActive: { color: colors.cyan },
});
