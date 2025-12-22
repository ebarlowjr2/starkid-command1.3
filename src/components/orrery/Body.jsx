/**
 * Body component - renders a planet or comet in the 3D scene
 */
import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { VISUAL_RADIUS, BODY_COLORS, shortLabel } from '../../lib/solarScale.js'

export function Body({
  name,
  position,
  showLabel,
  isSelected,
  onSelect
}) {
  const meshRef = useRef(null)
  
  // Rotate the body slowly
  useFrame(() => {
    if (!meshRef.current) return
    meshRef.current.rotation.y += isSelected ? 0.01 : 0.003
  })
  
  const r = VISUAL_RADIUS[name.toUpperCase()] || 0.18 // Default for comets
  const color = BODY_COLORS[name.toUpperCase()] || '#88ccff' // Default cyan for comets
  const isSun = name.toUpperCase() === 'SUN'
  
  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation()
          onSelect(name)
        }}
      >
        <sphereGeometry args={[r, 24, 24]} />
        {isSun ? (
          <meshBasicMaterial color={color} />
        ) : (
          <meshStandardMaterial 
            color={color} 
            emissive={isSelected ? color : '#000000'}
            emissiveIntensity={isSelected ? 0.3 : 0}
          />
        )}
      </mesh>
      
      {/* Glow effect for the Sun */}
      {isSun && (
        <mesh>
          <sphereGeometry args={[r * 1.2, 24, 24]} />
          <meshBasicMaterial color={color} transparent opacity={0.3} />
        </mesh>
      )}
      
      {/* Selection ring */}
      {isSelected && !isSun && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[r * 1.3, r * 1.5, 32]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.6} side={2} />
        </mesh>
      )}
      
      {showLabel && (
        <Text
          position={[0, r + 0.3, 0]}
          fontSize={0.35}
          color="#00ffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {shortLabel(name)}
        </Text>
      )}
    </group>
  )
}

export default Body
