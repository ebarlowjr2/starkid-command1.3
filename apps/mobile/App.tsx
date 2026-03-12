import React, { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { configureCore, configureStorage, ROUTE_MANIFEST, getSession, onAuthChange } from '@starkid/core'
import { storageAdapter } from './src/platform/storage.native'

import LaunchesScreen from './src/screens/LaunchesScreen'
import SkyEventsScreen from './src/screens/SkyEventsScreen'
import CometsScreen from './src/screens/CometsScreen'
import SolarMapScreen from './src/screens/SolarMapScreen'
import StreamsScreen from './src/screens/StreamsScreen'
import MissionBriefingScreen from './src/screens/MissionBriefingScreen'
import StemActivityDetailScreen from './src/screens/StemActivityDetailScreen'
import StemProgressScreen from './src/screens/StemProgressScreen'
import PlanetsScreen from './src/screens/PlanetsScreen'
import BeyondSolarSystemScreen from './src/screens/BeyondSolarSystemScreen'
import MissionAlertsScreen from './src/screens/MissionAlertsScreen'
import RocketsScreen from './src/screens/RocketsScreen'
import RocketDetailScreen from './src/screens/RocketDetailScreen'
import SpacecraftHubScreen from './src/screens/SpacecraftHubScreen'
import SpacecraftDetailScreen from './src/screens/SpacecraftDetailScreen'
import PlanetDetailScreen from './src/screens/PlanetDetailScreen'
import UpdatesHubScreen from './src/screens/UpdatesHubScreen'
import UpdatesNewsScreen from './src/screens/UpdatesNewsScreen'
import UpdatesBlogScreen from './src/screens/UpdatesBlogScreen'
import UpdatesOfficialScreen from './src/screens/UpdatesOfficialScreen'
import UpdatesLiveScreen from './src/screens/UpdatesLiveScreen'
import UpdatesXScreen from './src/screens/UpdatesXScreen'
import AppTabs from './src/navigation/AppTabs'

const Stack = createNativeStackNavigator()

configureCore({
  nasaApiKey: process.env.EXPO_PUBLIC_NASA_API_KEY,
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  apiBase: process.env.EXPO_PUBLIC_API_BASE,
})

configureStorage(storageAdapter)

export default function App() {
  const [fontsReady, setFontsReady] = useState(true)

  useEffect(() => {
    let active = true
    async function loadFonts() {
      try {
        const fontModule = require('expo-font')
        const pressStart = require('@expo-google-fonts/press-start-2p')
        if (fontModule?.loadAsync && pressStart?.PressStart2P_400Regular) {
          setFontsReady(false)
          await fontModule.loadAsync({
            PressStart2P_400Regular: pressStart.PressStart2P_400Regular,
          })
        }
      } catch (error) {
        // Fonts are optional; fall back to system font if not available.
      } finally {
        if (active) setFontsReady(true)
      }
    }
    loadFonts()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    async function initAuth() {
      await getSession()
    }
    initAuth()
    const unsubscribe = onAuthChange(() => {})
    return () => {
      active = false
      unsubscribe?.()
    }
  }, [])

  if (!fontsReady) {
    return null
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#0b0f1a' },
          headerTintColor: '#f9fafb',
          contentStyle: { backgroundColor: '#0b0f1a' },
        }}
      >
        <Stack.Screen name="AppTabs" component={AppTabs} options={{ headerShown: false }} />
        <Stack.Screen name={ROUTE_MANIFEST.LAUNCHES} component={LaunchesScreen} />
        <Stack.Screen name={ROUTE_MANIFEST.SKY_EVENTS} component={SkyEventsScreen} />
        <Stack.Screen name={ROUTE_MANIFEST.COMETS} component={CometsScreen} />
        <Stack.Screen name={ROUTE_MANIFEST.SOLAR_MAP} component={SolarMapScreen} />
        <Stack.Screen name={ROUTE_MANIFEST.STREAMS} component={StreamsScreen} />
        <Stack.Screen name={ROUTE_MANIFEST.STEM_ACTIVITY_DETAIL} component={StemActivityDetailScreen} />
        <Stack.Screen name={ROUTE_MANIFEST.STEM_PROGRESS} component={StemProgressScreen} />
        <Stack.Screen name={ROUTE_MANIFEST.PLANETS} component={PlanetsScreen} />
        <Stack.Screen name={ROUTE_MANIFEST.PLANET_DETAIL} component={PlanetDetailScreen} />
        <Stack.Screen name={ROUTE_MANIFEST.BEYOND} component={BeyondSolarSystemScreen} />
        <Stack.Screen name={ROUTE_MANIFEST.MISSION_ALERTS} component={MissionAlertsScreen} />
        <Stack.Screen name={ROUTE_MANIFEST.ROCKETS} component={RocketsScreen} />
        <Stack.Screen name={ROUTE_MANIFEST.ROCKET_DETAIL} component={RocketDetailScreen} />
        <Stack.Screen name={ROUTE_MANIFEST.SPACECRAFT_HUB} component={SpacecraftHubScreen} />
        <Stack.Screen name={ROUTE_MANIFEST.SPACECRAFT_DETAIL} component={SpacecraftDetailScreen} />
        <Stack.Screen name={ROUTE_MANIFEST.UPDATES_HUB} component={UpdatesHubScreen} />
        <Stack.Screen name={ROUTE_MANIFEST.UPDATES_NEWS} component={UpdatesNewsScreen} />
        <Stack.Screen name={ROUTE_MANIFEST.UPDATES_BLOG} component={UpdatesBlogScreen} />
        <Stack.Screen name={ROUTE_MANIFEST.UPDATES_OFFICIAL} component={UpdatesOfficialScreen} />
        <Stack.Screen name={ROUTE_MANIFEST.UPDATES_LIVE} component={UpdatesLiveScreen} />
        <Stack.Screen name={ROUTE_MANIFEST.UPDATES_X} component={UpdatesXScreen} />
        <Stack.Screen name={ROUTE_MANIFEST.MISSIONS_BRIEFING} component={MissionBriefingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
