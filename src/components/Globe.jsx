import React, { useEffect, useRef } from 'react'

export default function Globe({ launchSites = [] }) {
  const canvasRef = useRef(null)
  const wwdRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current || !window.WorldWind) return

    const WorldWind = window.WorldWind
    const wwd = new WorldWind.WorldWindow(canvasRef.current.id)
    wwdRef.current = wwd

    const layers = [
      { layer: new WorldWind.BMNGOneImageLayer(), enabled: true },
      { layer: new WorldWind.BMNGLandsatLayer(), enabled: false },
      { layer: new WorldWind.BingAerialWithLabelsLayer(null), enabled: false },
      { layer: new WorldWind.AtmosphereLayer(), enabled: true },
      { layer: new WorldWind.StarFieldLayer(), enabled: true },
      { layer: new WorldWind.CompassLayer(), enabled: true },
      { layer: new WorldWind.CoordinatesDisplayLayer(wwd), enabled: true },
      { layer: new WorldWind.ViewControlsLayer(wwd), enabled: true }
    ]

    for (let l = 0; l < layers.length; l++) {
      layers[l].layer.enabled = layers[l].enabled
      wwd.addLayer(layers[l].layer)
    }

    wwd.navigator.range = 20000000

    return () => {
      if (wwdRef.current) {
        wwdRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!wwdRef.current || !window.WorldWind || !launchSites.length) return

    const WorldWind = window.WorldWind
    const wwd = wwdRef.current

    let placemarkLayer = wwd.layers.find(l => l.displayName === 'Launch Sites')
    if (!placemarkLayer) {
      placemarkLayer = new WorldWind.RenderableLayer('Launch Sites')
      wwd.addLayer(placemarkLayer)
    } else {
      placemarkLayer.removeAllRenderables()
    }

    const placemarkAttributes = new WorldWind.PlacemarkAttributes(null)
    placemarkAttributes.imageScale = 0.5
    placemarkAttributes.imageColor = WorldWind.Color.RED
    placemarkAttributes.labelAttributes.color = WorldWind.Color.CYAN
    placemarkAttributes.labelAttributes.offset = new WorldWind.Offset(
      WorldWind.OFFSET_FRACTION, 0.5,
      WorldWind.OFFSET_FRACTION, 1.5
    )
    placemarkAttributes.imageSource = WorldWind.configuration.baseUrl + 'images/pushpins/castshadow-red.png'

    launchSites.forEach(site => {
      if (site.latitude && site.longitude) {
        const placemark = new WorldWind.Placemark(
          new WorldWind.Position(site.latitude, site.longitude, 1e2),
          false,
          placemarkAttributes
        )
        placemark.label = site.name || 'Launch Site'
        placemark.altitudeMode = WorldWind.RELATIVE_TO_GROUND
        placemarkLayer.addRenderable(placemark)
      }
    })

    wwd.redraw()
  }, [launchSites])

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        id="globe-canvas"
        className="w-full h-full"
        style={{ background: 'black' }}
      >
        Your browser does not support HTML5 Canvas.
      </canvas>
    </div>
  )
}
