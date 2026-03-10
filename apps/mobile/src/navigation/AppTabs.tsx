import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ROUTE_MANIFEST } from "@starkid/core";
import HomeScreen from "../screens/HomeScreen";
import ExploreHubV2 from "../screens/ExploreHubV2";
import CommandCenterScreen from "../screens/CommandCenterScreen";
import SkyEventsScreen from "../screens/SkyEventsScreen";
import StemActivitiesScreen from "../screens/StemActivitiesScreen";
import ProfileScreen from "../screens/ProfileScreen";
import CometScreen from "../screens/CometScreen";
import { CustomTabBar } from "./CustomTabBar";

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <CustomTabBar {...props} />}>
      <Tab.Screen name={ROUTE_MANIFEST.HOME} component={HomeScreen} options={{ title: "Home" }} />
      <Tab.Screen name={ROUTE_MANIFEST.EXPLORE} component={ExploreHubV2} options={{ title: "Explore" }} />
      <Tab.Screen name={ROUTE_MANIFEST.COMMAND_CENTER} component={CommandCenterScreen} options={{ title: "Command" }} />
      <Tab.Screen name={ROUTE_MANIFEST.COMET} component={CometScreen} options={{ title: "C.O.M.E.T." }} />
      <Tab.Screen name={ROUTE_MANIFEST.LUNAR_EVENTS} component={SkyEventsScreen} options={{ title: "Lunar Events" }} />
      <Tab.Screen name={ROUTE_MANIFEST.STEM_ACTIVITIES} component={StemActivitiesScreen} options={{ title: "S.T.E.M." }} />
      <Tab.Screen name={ROUTE_MANIFEST.PROFILE} component={ProfileScreen} options={{ title: "Profile" }} />
    </Tab.Navigator>
  );
}
