export interface Trek {
  name: string
  date?: string // ISO date, e.g. '2025-08-14', or just the month ('2026-01') if the day isn't known
  gpx?: string // file name inside src/data/treks/gpx/
  location?: [number, number] // approximate start point, used to place treks without a GPX on the map
  distanceKm?: number // overrides the value computed from the GPX (required without a GPX)
  elevationGainM?: number // overrides the value computed from the GPX
  maxElevationM?: number // overrides the value computed from the GPX
  region?: string
  duration?: string // e.g. '3h 30m'
  description?: string
  post?: string // optional link to a blog post/note about the trek
}

// Processed trek passed to the map (built from the GPX at build time)
export interface TrekRoute {
  name: string
  date?: string
  distanceKm: number
  elevationGainM?: number
  maxElevationM?: number // highest point reached, if the GPX has elevation data
  region?: string
  duration?: string
  description?: string
  post?: string
  hasTrack: boolean // false when the route is only an approximate start point (no GPX)
  coords: [number, number][]
}

// Totals across all treks, shown below the map
export interface TrekStats {
  count: number
  totalDistanceKm: number
  totalElevationGainM: number
  highestPointM: number
}

// To add a trek: drop the GPX export into src/data/treks/gpx/ named
// `<yyyy-mm-dd>-<trek-name>.gpx` and add an entry here (oldest first).
// Without a GPX, set `location` and `distanceKm` by hand instead.
export const treks: Trek[] = [
  {
    name: 'Bamboo Trail, U Mawryngkhang',
    date: '2026-01',
    // Built from the OSM route (out and back), not a recorded track. No elevation: the DEM can't resolve the cliffs
    gpx: '2026-01-bamboo-trail-mawryngkhang.gpx',
    region: 'Wahkhen, East Khasi Hills, Meghalaya',
  },
  {
    name: 'La Via Sacra, Monte Cavo',
    date: '2026-09-29',
    gpx: '2026-09-29-la-via-sacra-monte-cavo.gpx',
    region: 'Rocca di Papa, Castelli Romani, Italy',
  },
  {
    name: 'Monte Catillo Nature Reserve Loop',
    date: '2026-09-30',
    gpx: '2026-09-30-monte-catillo-nature-reserve-loop.gpx',
    region: 'Tivoli, Lazio, Italy',
  },
  {
    name: 'Vintgar Gorge Loop',
    date: '2026-10',
    // Built from the OSM routes for the gorge path + King of Triglav trail, not a recorded track
    gpx: '2026-10-vintgar-gorge-loop.gpx',
    elevationGainM: 153, // published ascent, the DEM elevation in the GPX is too noisy inside the gorge
    region: 'Podhom, near Bled, Slovenia',
  },
]

export default treks
