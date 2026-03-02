import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { configureCore, configureStorage, ROUTE_MANIFEST } from '@starkid/core'
import { storageAdapter } from './src/platform/storage.native'

import HomeScreen from './src/screens/HomeScreen'
import ExploreScreen from './src/screens/ExploreScreen'
import CommandCenterScreen from './src/screens/CommandCenterScreen'
import LaunchesScreen from './src/screens/LaunchesScreen'
import SkyEventsScreen from './src/screens/SkyEventsScreen'
import CometsScreen from './src/screens/CometsScreen'
import SolarMapScreen from './src/screens/SolarMapScreen'
import StreamsScreen from './src/screens/StreamsScreen'
import MissionBriefingScreen from './src/screens/MissionBriefingScreen'

const Stack = createNativeStackNavigator()

configureCore({
  nasaApiKey: process.env.EXPO_PUBLIC_NASA_API_KEY,
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  apiBase: process.env.EXPO_PUBLIC_API_BASE,
})

configureStorage(storageAdapter)

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#0b0f1a' },
          headerTintColor: '#f9fafb',
          contentStyle: { backgroundColor: '#0b0f1a' },
        }}
      >
        <Stack.Screen name={ROUTE_MANIFEST.HOME} component={HomeScreen} />
        <Stack.Screen name={ROUTE_MANIFEST.EXPLORE} component={ExploreScreen} />
        <Stack.Screen name={ROUTE_MANIFEST.COMMAND_CENTER} component={CommandCenterScreen} />
        <Stack.Screen name={ROUTE_MANIFEST.LAUNCHES} component={LaunchesScreen} />
        <Stack.Screen name={ROUTE_MANIFEST.SKY_EVENTS} component={SkyEventsScreen} />
        <Stack.Screen name={ROUTE_MANIFEST.COMETS} component={CometsScreen} />
        <Stack.Screen name={ROUTE_MANIFEST.SOLAR_MAP} component={SolarMapScreen} />
        <Stack.Screen name={ROUTE_MANIFEST.STREAMS} component={StreamsScreen} />
        <Stack.Screen name={ROUTE_MANIFEST.MISSIONS_BRIEFING} component={MissionBriefingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
