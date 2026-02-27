/**
 * EclipticPlane component - renders a reference plane for the ecliptic
 */
import React from 'react'

export function EclipticPlane({ size = 120 }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[size, 64]} />
      <meshBasicMaterial 
        color="#00ffff" 
        transparent 
        opacity={0.05} 
        side={2}
      />
    </mesh>
  )
}

export default EclipticPlane
