export interface Trek {
  name: string
  date?: string // ISO date, e.g. '2025-08-14'
  gpx: string // file name inside src/data/treks/gpx/
  distanceKm?: number // overrides the value computed from the GPX
  elevationGainM?: number // overrides the value computed from the GPX
  description?: string
  post?: string // optional link to a blog post/note about the trek
}

// Processed trek passed to the map (built from the GPX at build time)
export interface TrekRoute {
  name: string
  date?: string
  distanceKm: number
  elevationGainM: number
  description?: string
  post?: string
  coords: [number, number][]
}

// To add a trek: drop the GPX export into src/data/treks/gpx/ named
// `<yyyy-mm-dd>-<trek-name>.gpx` and add an entry here (oldest first).
export const treks: Trek[] = [
  {
    name: 'La Via Sacra, Monte Cavo',
    date: '2026-09-29',
    gpx: '2026-09-29-la-via-sacra-monte-cavo.gpx',
  },
  {
    name: 'Monte Catillo Nature Reserve Loop',
    date: '2026-09-30',
    gpx: '2026-09-30-monte-catillo-nature-reserve-loop.gpx',
  },
]

export default treks
