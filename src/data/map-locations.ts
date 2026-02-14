export type PlaceCategory = 'current' | 'visited' | 'wishlist' | 'hometown'

export interface Place {
  name: string
  lat: number
  lng: number
  category: PlaceCategory
  description?: string
}

export interface MapLocationsData {
  currentLocation: Place
  places: Place[]
}

// Category descriptions for the legend/tooltip
export const categoryLabels: Record<PlaceCategory, string> = {
  current: 'Current Location',
  visited: 'Visited',
  wishlist: 'Want to Visit',
  hometown: 'Hometown',
}

export const mapLocations: MapLocationsData = {
  // Your current live location
  currentLocation: {
    name: 'Rome, Italy',
    lat: 41.9028,
    lng: 12.4964,
    category: 'current',
    description: 'Where I currently live',
  },
  // List of places
  places: [
    // Hometown
    {
      name: 'Duliajan, India',
      lat: 27.3573,
      lng: 95.3232,
      category: 'hometown',
    },

    // Places I have visited
    {
      name: 'Shillong, India',
      lat: 25.5788,
      lng: 91.8933,
      category: 'visited',
    },
    {
      name: 'New Delhi, India',
      lat: 28.6139,
      lng: 77.2090,
      category: 'visited',
    },
    {
      name: 'Bangalore, India',
      lat: 12.9716,
      lng: 77.5946,
      category: 'visited',
    },
    {
      name: 'Kolkata, India',
      lat: 22.5726,
      lng: 88.3639,
      category: 'visited',
    },

    // Places I want to visit
    {
      name: 'Tokyo, Japan',
      lat: 35.6762,
      lng: 139.6503,
      category: 'wishlist',
    },
    {
      name: 'Paris, France',
      lat: 48.8566,
      lng: 2.3522,
      category: 'wishlist',
    },
    {
      name: 'New York, USA',
      lat: 40.7128,
      lng: -74.006,
      category: 'wishlist',
    },
    {
      name: 'Sydney, Australia',
      lat: -33.8688,
      lng: 151.2093,
      category: 'wishlist',
    },
    {
      name: 'Barcelona, Spain',
      lat: 41.3851,
      lng: 2.1734,
      category: 'wishlist',
    },

  ],
}

export default mapLocations
