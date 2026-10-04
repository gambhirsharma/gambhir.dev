import type { Trek, TrekRoute, TrekStats } from '@/data/treks'

// Build-time only: GPX files are inlined as raw strings here, so this module must
// never be imported from a client-side component.
const gpxFiles = import.meta.glob<string>('../data/treks/gpx/*.gpx', {
  query: '?raw',
  import: 'default',
  eager: true,
})

interface TrackPoint {
  lat: number
  lng: number
  ele?: number
}

// Distance trimmed from both ends of every track so it doesn't reveal where I stayed
const PRIVACY_TRIM_M = 200
// Douglas-Peucker tolerance in degrees (~30 m), plenty for the map's max zoom
const SIMPLIFY_TOLERANCE = 0.0003
// Ignore elevation wiggles smaller than this when summing gain (GPS noise)
const ELEVATION_NOISE_M = 3

function parseGpx(xml: string): TrackPoint[] {
  const points: TrackPoint[] = []
  const pointRe = /<(?:trkpt|rtept)\b([^>]*?)(?:\/>|>([\s\S]*?)<\/(?:trkpt|rtept)>)/g

  for (const [, attrs, body] of xml.matchAll(pointRe)) {
    const lat = attrs.match(/\blat="([^"]+)"/)?.[1]
    const lng = attrs.match(/\blon="([^"]+)"/)?.[1]
    if (!lat || !lng)
      continue
    const ele = body?.match(/<ele>([^<]+)<\/ele>/)?.[1]
    points.push({
      lat: Number(lat),
      lng: Number(lng),
      ele: ele !== undefined ? Number(ele) : undefined,
    })
  }

  return points
}

function haversine(a: TrackPoint, b: TrackPoint) {
  const R = 6371000
  const toRad = (deg: number) => deg * Math.PI / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

function cumulativeDistances(points: TrackPoint[]) {
  const dists = [0]
  for (let i = 1; i < points.length; i++)
    dists.push(dists[i - 1] + haversine(points[i - 1], points[i]))
  return dists
}

function elevationGain(points: TrackPoint[]) {
  let gain = 0
  let ref: number | undefined
  for (const { ele } of points) {
    if (ele === undefined || Number.isNaN(ele))
      continue
    if (ref === undefined || ref - ele > ELEVATION_NOISE_M) {
      ref = ele
    }
    else if (ele - ref > ELEVATION_NOISE_M) {
      gain += ele - ref
      ref = ele
    }
  }
  return gain
}

function trimEnds(points: TrackPoint[], dists: number[]) {
  const total = dists[dists.length - 1]
  // Too short to trim meaningfully, keep it as is
  if (total < PRIVACY_TRIM_M * 4)
    return points
  return points.filter((_, i) => dists[i] >= PRIVACY_TRIM_M && dists[i] <= total - PRIVACY_TRIM_M)
}

function perpendicularDistance(p: TrackPoint, a: TrackPoint, b: TrackPoint) {
  const dx = b.lng - a.lng
  const dy = b.lat - a.lat
  if (dx === 0 && dy === 0)
    return Math.hypot(p.lng - a.lng, p.lat - a.lat)
  const t = Math.max(0, Math.min(1, ((p.lng - a.lng) * dx + (p.lat - a.lat) * dy) / (dx * dx + dy * dy)))
  return Math.hypot(p.lng - (a.lng + t * dx), p.lat - (a.lat + t * dy))
}

// Iterative Douglas-Peucker to keep the payload sent to the map island small
function simplify(points: TrackPoint[], tolerance: number) {
  if (points.length <= 2)
    return points
  const keep = new Uint8Array(points.length)
  keep[0] = 1
  keep[points.length - 1] = 1
  const stack: [number, number][] = [[0, points.length - 1]]

  while (stack.length) {
    const [start, end] = stack.pop()!
    let maxDist = 0
    let index = -1
    for (let i = start + 1; i < end; i++) {
      const d = perpendicularDistance(points[i], points[start], points[end])
      if (d > maxDist) {
        maxDist = d
        index = i
      }
    }
    if (index !== -1 && maxDist > tolerance) {
      keep[index] = 1
      stack.push([start, index], [index, end])
    }
  }

  return points.filter((_, i) => keep[i])
}

const round = (n: number, digits: number) => Number(n.toFixed(digits))

function maxElevation(points: TrackPoint[]) {
  const eles = points.map(p => p.ele).filter((e): e is number => e !== undefined && !Number.isNaN(e))
  return eles.length ? Math.round(Math.max(...eles)) : undefined
}

export function getTrekStats(routes: TrekRoute[]): TrekStats {
  return {
    count: routes.length,
    totalDistanceKm: round(routes.reduce((sum, r) => sum + r.distanceKm, 0), 1),
    totalElevationGainM: routes.reduce((sum, r) => sum + r.elevationGainM, 0),
    highestPointM: Math.max(0, ...routes.map(r => r.maxElevationM ?? 0)),
  }
}

export function buildTrekRoutes(treks: Trek[]): TrekRoute[] {
  return treks.map((trek) => {
    const xml = Object.entries(gpxFiles).find(([path]) => path.endsWith(`/${trek.gpx}`))?.[1]
    if (!xml)
      throw new Error(`[treks] GPX file "${trek.gpx}" for "${trek.name}" not found in src/data/treks/gpx/`)

    const points = parseGpx(xml)
    if (points.length < 2)
      throw new Error(`[treks] GPX file "${trek.gpx}" has no track points`)

    const dists = cumulativeDistances(points)
    const route = simplify(trimEnds(points, dists), SIMPLIFY_TOLERANCE)

    return {
      name: trek.name,
      date: trek.date,
      distanceKm: trek.distanceKm ?? round(dists[dists.length - 1] / 1000, 1),
      elevationGainM: trek.elevationGainM ?? Math.round(elevationGain(points)),
      maxElevationM: maxElevation(points),
      description: trek.description,
      post: trek.post,
      coords: route.map(p => [round(p.lat, 5), round(p.lng, 5)]),
    }
  })
}
