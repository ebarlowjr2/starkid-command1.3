export const FEATURES = [
  {
    id: "command-center",
    title: "Command Center",
    description: "Your mission control dashboard with real-time space data, ISS tracking, and daily astronomy updates.",
    route: "/command",
    thumbnail: "/thumbs/command-center.png",
    status: "live",
    color: "#22d3ee",
  },
  {
    id: "solar-map",
    title: "3D Solar Map",
    description: "Interactive 3D solar system viewer with orbit lines, labels, and object focus.",
    route: "/solar-map",
    thumbnail: "/thumbs/solar-map.png",
    status: "live",
    color: "#22d3ee",
  },
  {
    id: "planets",
    title: "Visit Another Planet",
    description: "Pick a planet and enter a mini command center. Mars includes rover rotation + data.",
    route: "/planets",
    thumbnail: "/thumbs/planets.png",
    status: "live",
    color: "#22d3ee",
  },
  {
    id: "rockets",
    title: "Rocket Science",
    description: "Browse 167 active rockets and dive into specs like payload, thrust, and dimensions.",
    route: "/rockets",
    thumbnail: "/thumbs/rockets.png",
    status: "live",
    color: "#f97316",
  },
  {
    id: "artemis",
    title: "Artemis Program",
    description: "Mission control dashboard for NASA's lunar program. Track Artemis I-IV, crew, and systems.",
    route: "/missions/artemis",
    thumbnail: "/thumbs/artemis.png",
    status: "live",
    color: "#3b82f6",
  },
  {
    id: "beyond",
    title: "Beyond Our Solar System",
    description: "Explore confirmed exoplanets by distance, star type, and discovery method.",
    route: "/beyond",
    thumbnail: "/thumbs/exoplanets.png",
    status: "live",
    color: "#a855f7",
  },
  {
    id: "sky-events",
    title: "Sky Events",
    description: "Track upcoming celestial events like eclipses, meteor showers, and planetary alignments.",
    route: "/sky-events",
    thumbnail: "/thumbs/sky-events.png",
    status: "live",
    color: "#22d3ee",
  },
  {
    id: "tonights-mission",
    title: "Tonight's Sky Mission",
    description: "Get personalized stargazing recommendations based on your location and current conditions.",
    route: "/tonights-mission",
    thumbnail: "/thumbs/tonights-mission.png",
    status: "live",
    color: "#22d3ee",
  },
  {
    id: "comets",
    title: "Comets",
    description: "Track active comets with orbital data, visibility predictions, and observation tips.",
    route: "/comets",
    thumbnail: "/thumbs/comets.png",
    status: "live",
    color: "#22d3ee",
  },
]

export function getStatusLabel(status) {
  switch (status) {
    case "live":
      return "ONLINE"
    case "beta":
      return "BETA"
    case "coming_soon":
      return "COMING SOON"
    default:
      return "ONLINE"
  }
}

export function getStatusColor(status) {
  switch (status) {
    case "live":
      return "#22c55e"
    case "beta":
      return "#eab308"
    case "coming_soon":
      return "#6b7280"
    default:
      return "#22c55e"
  }
}
