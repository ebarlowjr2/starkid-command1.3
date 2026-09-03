import React, { useEffect, useRef } from 'react'

function resetNavigator(wwd) {
  wwd.navigator.lookAtLocation.latitude = 22
  wwd.navigator.lookAtLocation.longitude = -58
  wwd.navigator.range = 18500000
  wwd.navigator.heading = 0
  wwd.navigator.tilt = 0
  wwd.redraw()
}

export default function Globe({ resetSignal = 0 }) {
  const canvasRef = useRef(null)
  const wwdRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current || !window.WorldWind) return undefined
    const WorldWind = window.WorldWind
    const wwd = new WorldWind.WorldWindow(canvasRef.current.id)
    wwdRef.current = wwd

    // The globe remains intentionally clean: the live feed carries the launch data.
    const layers = [
      new WorldWind.BMNGOneImageLayer(),
      new WorldWind.AtmosphereLayer(),
      new WorldWind.StarFieldLayer(),
    ]
    layers.forEach((layer) => wwd.addLayer(layer))
    resetNavigator(wwd)

    return () => { wwdRef.current = null }
  }, [])

  useEffect(() => {
    if (wwdRef.current && window.WorldWind) resetNavigator(wwdRef.current)
  }, [resetSignal])

  return <canvas ref={canvasRef} id="globe-canvas" className="h-full w-full cursor-grab active:cursor-grabbing" style={{ background: '#02060d' }}>Your browser does not support HTML5 Canvas.</canvas>
}
