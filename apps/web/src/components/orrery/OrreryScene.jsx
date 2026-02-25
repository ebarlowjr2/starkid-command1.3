/**
 * OrreryScene component - main 3D scene containing all solar system elements
 */
import React, { useEffect, useRef } from 'react'
import { OrbitControls, Stars } from '@react-three/drei'
import { Body } from './Body.jsx'
import { OrbitPath } from './OrbitPath.jsx'
import { EclipticPlane } from './EclipticPlane.jsx'

export function OrreryScene({
  positions,
  orbitLines,
  showLabels,
  showOrbits,
  showPlane,
  selected,
  onSelect,
  focusRequest
}) {
  const controlsRef = useRef(null)
  
  // Handle focus requests (when user clicks a body)
  useEffect(() => {
    if (!focusRequest || !controlsRef.current) return
    controlsRef.current.target.copy(focusRequest.target)
    controlsRef.current.update()
  }, [focusRequest])
  
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 0, 0]} intensity={2.2} color="#ffdd44" />
      
      {/* Starfield background */}
      <Stars 
        radius={220} 
        depth={80} 
        count={3000} 
        factor={3} 
        fade 
        speed={0.5} 
      />
      
      {/* Optional ecliptic plane */}
      {showPlane && <EclipticPlane />}
      
      {/* Orbit paths */}
      {showOrbits && Object.entries(orbitLines).map(([name, pts]) => (
        <OrbitPath key={`orbit-${name}`} name={name} points={pts} />
      ))}
      
      {/* Celestial bodies */}
      {Object.entries(positions).map(([name, pos]) => (
        <Body
          key={name}
          name={name}
          position={pos}
          showLabel={showLabels}
          isSelected={selected === name}
          onSelect={onSelect}
        />
      ))}
      
      {/* Camera controls */}
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.6}
        zoomSpeed={0.7}
        panSpeed={0.6}
        minDistance={6}
        maxDistance={200}
      />
    </>
  )
}

export default OrreryScene
