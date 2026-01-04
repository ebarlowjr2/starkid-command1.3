import { useMemo, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import * as THREE from "three"

function NebulaPoints({ count = 12000 }) {
  const pointsRef = useRef(null)

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const r = Math.pow(Math.random(), 0.45) * 6.5
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = r * Math.sin(phi) * Math.sin(theta)
      const z = r * Math.cos(phi)

      positions[i * 3 + 0] = x * 1.25
      positions[i * 3 + 1] = y * 0.85
      positions[i * 3 + 2] = z * 1.05

      const colorChoice = Math.random()
      if (colorChoice < 0.4) {
        colors[i * 3 + 0] = 0.3 + Math.random() * 0.3
        colors[i * 3 + 1] = 0.5 + Math.random() * 0.3
        colors[i * 3 + 2] = 0.9 + Math.random() * 0.1
      } else if (colorChoice < 0.7) {
        colors[i * 3 + 0] = 0.6 + Math.random() * 0.3
        colors[i * 3 + 1] = 0.2 + Math.random() * 0.2
        colors[i * 3 + 2] = 0.7 + Math.random() * 0.3
      } else {
        colors[i * 3 + 0] = 0.2 + Math.random() * 0.2
        colors[i * 3 + 1] = 0.7 + Math.random() * 0.2
        colors[i * 3 + 2] = 0.8 + Math.random() * 0.2
      }
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3))
    return geo
  }, [count])

  const material = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.035,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
    })
  }, [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (pointsRef.current) {
      pointsRef.current.rotation.y = t * 0.06
      pointsRef.current.rotation.x = Math.sin(t * 0.15) * 0.08
    }
  })

  return <points ref={pointsRef} geometry={geometry} material={material} />
}

export default function NebulaHero() {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768
  const particleCount = isMobile ? 7000 : 16000

  return (
    <div style={{ width: "100%", height: "100%", borderRadius: 20, overflow: "hidden" }}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <fog attach="fog" args={["#000000", 6, 16]} />
        <ambientLight intensity={0.6} />
        <NebulaPoints count={particleCount} />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          rotateSpeed={0.35}
          minPolarAngle={Math.PI * 0.35}
          maxPolarAngle={Math.PI * 0.65}
        />
      </Canvas>
    </div>
  )
}
