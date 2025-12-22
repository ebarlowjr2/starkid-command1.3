/**
 * OrbitPath component - renders an orbit line in the 3D scene
 */
import React from 'react'
import { Line } from '@react-three/drei'
import { BODY_COLORS } from '../../lib/solarScale.js'

export function OrbitPath({ name, points }) {
  if (!points || points.length < 2) return null
  
  const color = BODY_COLORS[name.toUpperCase()] || '#88ccff'
  
  return (
    <Line
      points={points}
      color={color}
      lineWidth={1}
      transparent
      opacity={0.5}
    />
  )
}

export default OrbitPath
