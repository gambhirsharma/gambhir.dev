export interface Trek {
  name: string
  date?: string // ISO date, e.g. '2025-08-14'
  gpx: string // file name inside src/data/treks/
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

// To add a trek: drop the GPX export into src/data/treks/ and add an entry here.
// Example:
// {
//   name: 'Tre Cime di Lavaredo',
//   date: '2025-08-14',
//   gpx: 'tre-cime.gpx',
// },
export const treks: Trek[] = [
  {
    name: 'Monte Catillo Nature Reserve Loop',
    gpx: 'tivoli-monte-catillo.gpx',
  },
]

export default treks
