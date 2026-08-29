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
    {
      name: 'Prague, Czech Republic',
      lat: 50.0755,
      lng: 14.4378,
      category: 'visited',
    },
    {
      name: 'Thessaloniki, Greece',
      lat: 40.6401,
      lng: 22.9444,
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
    {
      name: 'Wadi Rum, Jordan',
      lat: 29.5731,
      lng: 35.4206,
      category: 'wishlist',
    },
    {
      name: 'Petra, Jordan',
      lat: 30.3285,
      lng: 35.4444,
      category: 'wishlist',
    },
    {
      name: 'Dead Sea',
      lat: 31.559,
      lng: 35.4732,
      category: 'wishlist',
    },
    {
      name: 'ROT-54 Radio Observatory, Armenia',
      lat: 40.3492,
      lng: 44.254,
      category: 'wishlist',
      description: 'Radio Optical Observatory ROT-54/2.6 in Orgov, Armenia',
    },
    {
      name: 'Moscow, Russia',
      lat: 55.7558,
      lng: 37.6176,
      category: 'wishlist',
    },
    {
      name: 'Saint Petersburg, Russia',
      lat: 59.9343,
      lng: 30.3351,
      category: 'wishlist',
    },
    {
      name: 'Yellowstone National Park, USA',
      lat: 44.428,
      lng: -110.5885,
      category: 'wishlist',
    },
    {
      name: 'Osaka, Japan',
      lat: 34.6937,
      lng: 135.5023,
      category: 'wishlist',
    },
    {
      name: 'Hokkaido, Japan',
      lat: 43.0618,
      lng: 141.3545,
      category: 'wishlist',
    },
    {
      name: 'Beijing, China',
      lat: 39.9042,
      lng: 116.4074,
      category: 'wishlist',
    },
    {
      name: 'Shenzhen, China',
      lat: 22.5431,
      lng: 114.0579,
      category: 'wishlist',
    },
    {
      name: 'Bilbao, Spain',
      lat: 43.263,
      lng: -2.935,
      category: 'wishlist',
    },
    {
      name: 'Managua, Nicaragua',
      lat: 12.114,
      lng: -86.2362,
      category: 'wishlist',
    },

  ],
}

export default mapLocations
