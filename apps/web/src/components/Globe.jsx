import React, { useEffect, useRef } from 'react'

function resetNavigator(wwd) {
  wwd.navigator.lookAtLocation.latitude = 22
  wwd.navigator.lookAtLocation.longitude = -58
  wwd.navigator.range = 18500000
  wwd.navigator.heading = 0
  wwd.navigator.tilt = 0
  wwd.redraw()
}

function markerAttributes(WorldWind, color, scale) {
  const attributes = new WorldWind.PlacemarkAttributes(null)
  attributes.imageScale = scale
  attributes.imageColor = color
  attributes.imageSource = `${WorldWind.configuration.baseUrl}images/pushpins/castshadow-red.png`
  return attributes
}

function addMarker(WorldWind, layer, event, attributes, altitude = 160000) {
  const placemark = new WorldWind.Placemark(
    new WorldWind.Position(event.latitude, event.longitude, altitude),
    false,
    attributes,
  )
  placemark.altitudeMode = WorldWind.RELATIVE_TO_GROUND
  placemark.userProperties = event
  layer.addRenderable(placemark)
}

export default function Globe({
  launches = [],
  earthEvents = [],
  activeLayers = [],
  resetSignal = 0,
}) {
  const canvasRef = useRef(null)
  const wwdRef = useRef(null)
  const overlayLayersRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current || !window.WorldWind) return undefined
    const WorldWind = window.WorldWind
    const wwd = new WorldWind.WorldWindow(canvasRef.current.id)
    wwdRef.current = wwd

    const baseLayers = [
      new WorldWind.BMNGOneImageLayer(),
      new WorldWind.AtmosphereLayer(),
      new WorldWind.StarFieldLayer(),
    ]
    baseLayers.forEach((layer) => wwd.addLayer(layer))

    // These are live event layers, never a permanent map of launch-site locations.
    const launchLayer = new WorldWind.RenderableLayer('Live launch events')
    const earthEventLayer = new WorldWind.RenderableLayer('Active Earth events')
    wwd.addLayer(launchLayer)
    wwd.addLayer(earthEventLayer)
    overlayLayersRef.current = { launchLayer, earthEventLayer }
    resetNavigator(wwd)

    return () => {
      overlayLayersRef.current = null
      wwdRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!wwdRef.current || !overlayLayersRef.current || !window.WorldWind) return
    const WorldWind = window.WorldWind
    const { launchLayer, earthEventLayer } = overlayLayersRef.current
    const showLaunches = activeLayers.includes('launches')
    const showEarthEvents = activeLayers.includes('earth-events')

    launchLayer.removeAllRenderables()
    earthEventLayer.removeAllRenderables()

    if (showLaunches) {
      const attributes = markerAttributes(WorldWind, WorldWind.Color.CYAN, 0.46)
      launches.slice(0, 12).forEach((launch) => {
        const latitude = Number(launch?.pad?.latitude)
        const longitude = Number(launch?.pad?.longitude)
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return
        addMarker(WorldWind, launchLayer, {
          id: launch.id,
          title: launch.name || 'Upcoming launch',
          latitude,
          longitude,
          kind: 'launch',
        }, attributes)
      })
    }

    if (showEarthEvents) {
      const attributes = markerAttributes(WorldWind, WorldWind.Color.YELLOW, 0.34)
      earthEvents.slice(0, 30).forEach((event) => addMarker(WorldWind, earthEventLayer, event, attributes, 90000))
    }

    wwdRef.current.redraw()
  }, [launches, earthEvents, activeLayers])

  useEffect(() => {
    if (wwdRef.current && window.WorldWind) resetNavigator(wwdRef.current)
  }, [resetSignal])

  return <canvas ref={canvasRef} id="globe-canvas" className="h-full w-full cursor-grab active:cursor-grabbing" style={{ background: '#02060d' }}>Your browser does not support HTML5 Canvas.</canvas>
}
