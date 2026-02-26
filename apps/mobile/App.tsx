import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { configureCore, configureStorage } from '@starkid/core'
import { storageAdapter } from './src/platform/storage.native'

import HomeScreen from './src/screens/HomeScreen'
import LaunchesScreen from './src/screens/LaunchesScreen'
import SkyEventsScreen from './src/screens/SkyEventsScreen'
import CometsScreen from './src/screens/CometsScreen'
import MissionBriefingScreen from './src/screens/MissionBriefingScreen'

const Stack = createNativeStackNavigator()

configureCore({
  nasaApiKey: process.env.EXPO_PUBLIC_NASA_API_KEY,
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
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
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Launches" component={LaunchesScreen} />
        <Stack.Screen name="Sky Events" component={SkyEventsScreen} />
        <Stack.Screen name="Comets" component={CometsScreen} />
        <Stack.Screen name="Mission Briefing" component={MissionBriefingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
