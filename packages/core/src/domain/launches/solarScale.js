/**
 * Scaling utilities for the 3D solar system visualization
 */
import * as THREE from 'three'

// Scale factor: 1 AU = 10 scene units
export const AU_SCALE = 10

// Visual radius for each body (not to physical scale, for visibility)
export const VISUAL_RADIUS = {
  SUN: 1.6,
  MERCURY: 0.18,
  VENUS: 0.22,
  EARTH: 0.24,
  MARS: 0.20,
  JUPITER: 0.60,
  SATURN: 0.52,
  URANUS: 0.40,
  NEPTUNE: 0.40
}

// Colors for each body
export const BODY_COLORS = {
  SUN: '#ffdd44',
  MERCURY: '#b0b0b0',
  VENUS: '#e6c87a',
  EARTH: '#4a90d9',
  MARS: '#c1440e',
  JUPITER: '#d8ca9d',
  SATURN: '#f4d59e',
  URANUS: '#b5e3e3',
  NEPTUNE: '#5b7fde'
}

/**
 * Convert AU coordinates to scene Vector3
 */
export function auToVec3(posAu) {
  return new THREE.Vector3(
    posAu.x * AU_SCALE,
    posAu.z * AU_SCALE, // Swap Y and Z for three.js coordinate system
    posAu.y * AU_SCALE
  )
}

/**
 * Get display label for a body
 */
export function shortLabel(key) {
  // Keep comet designations as-is
  if (key.toUpperCase().startsWith('C/') || key.toLowerCase().startsWith('c')) {
    return key
  }
  // Capitalize first letter only for planets
  return key.charAt(0) + key.slice(1).toLowerCase()
}
