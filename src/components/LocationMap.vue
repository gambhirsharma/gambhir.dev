<script lang="ts" setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useDark } from '@vueuse/core'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Place, PlaceCategory } from '@/data/map-locations'
import { categoryLabels } from '@/data/map-locations'

const props = defineProps<{
  currentLocation: Place
  places?: Place[]
  zoom?: number
}>()

const isDark = useDark()
const mapContainer = ref<HTMLElement | null>(null)
let map: L.Map | null = null
let tileLayer: L.TileLayer | null = null
let currentMarker: L.CircleMarker | null = null
let pulseMarker: L.CircleMarker | null = null
const placeMarkers: L.CircleMarker[] = []

// Minimal tile layers - using CartoDB Positron/Dark Matter for clean, minimal look
const lightTileUrl = 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png'
const darkTileUrl = 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png'

function getTileUrl() {
  return isDark.value ? darkTileUrl : lightTileUrl
}

// Colors for different place categories
function getMarkerColor(category: PlaceCategory) {
  const colors = {
    current: isDark.value ? '#4ade80' : '#22c55e', // Green for current location
    visited: isDark.value ? '#60a5fa' : '#3b82f6', // Blue for visited places
    wishlist: isDark.value ? '#f472b6' : '#ec4899', // Pink for wishlist places
    hometown: isDark.value ? '#fbbf24' : '#f59e0b', // Amber/Yellow for hometown
  }
  return colors[category]
}

function initMap() {
  if (!mapContainer.value)
    return

  const { currentLocation } = props

  map = L.map(mapContainer.value, {
    center: [currentLocation.lat, currentLocation.lng],
    zoom: props.zoom || 3,
    zoomControl: false,
    attributionControl: false,
    scrollWheelZoom: true,
    doubleClickZoom: true,
    dragging: true,
    touchZoom: true,
  })

  tileLayer = L.tileLayer(getTileUrl(), {
    maxZoom: 10,
    minZoom: 2,
  }).addTo(map)

  // Add place markers first (so current location appears on top)
  if (props.places && props.places.length > 0) {
    props.places.forEach((place) => {
      const marker = L.circleMarker([place.lat, place.lng], {
        radius: 3,
        fillColor: getMarkerColor(place.category),
        color: '#fff',
        weight: 0.5,
        opacity: 1,
        fillOpacity: 0.9,
      }).addTo(map!)

      const tooltipContent = `<strong>${place.name}</strong><br><span style="opacity: 0.7; font-size: 10px;">${categoryLabels[place.category]}</span>`
      marker.bindTooltip(tooltipContent, {
        permanent: false,
        direction: 'top',
        offset: [0, -8],
        className: `location-tooltip tooltip-${place.category}`,
      })

      placeMarkers.push(marker)
    })
  }

  // Create outer pulsing ring for current location
  pulseMarker = L.circleMarker([currentLocation.lat, currentLocation.lng], {
    radius: 18,
    fillColor: getMarkerColor('current'),
    color: 'transparent',
    weight: 0,
    opacity: 0,
    fillOpacity: 0.3,
    className: 'pulse-ring',
  }).addTo(map)

  // Create solid center marker for current location
  currentMarker = L.circleMarker([currentLocation.lat, currentLocation.lng], {
    radius: 4,
    fillColor: getMarkerColor('current'),
    color: '#fff',
    weight: 2,
    opacity: 1,
    fillOpacity: 1,
  }).addTo(map)

  // Add tooltip with current location name
  const tooltipContent = `<strong>${currentLocation.name}</strong><br><span style="opacity: 0.7; font-size: 10px;">Current Location</span>`
  currentMarker.bindTooltip(tooltipContent, {
    permanent: false,
    direction: 'top',
    offset: [0, -10],
    className: 'location-tooltip tooltip-current',
  })
}

function updateTheme() {
  if (!map || !tileLayer || !currentMarker || !pulseMarker)
    return

  // Update tile layer
  tileLayer.setUrl(getTileUrl())

  // Update current location marker colors
  currentMarker.setStyle({
    fillColor: getMarkerColor('current'),
  })

  pulseMarker.setStyle({
    fillColor: getMarkerColor('current'),
  })

  // Update place markers
  if (props.places) {
    props.places.forEach((place, index) => {
      if (placeMarkers[index]) {
        placeMarkers[index].setStyle({
          fillColor: getMarkerColor(place.category),
        })
      }
    })
  }
}

watch(isDark, () => {
  updateTheme()
})

onMounted(() => {
  initMap()
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<template>
  <div ref="mapContainer" class="location-map" />
</template>

<style>
.location-map {
  width: 100%;
  height: 360px;
  border-radius: 8px;
  overflow: hidden;
  cursor: grab;
}

.location-map:active {
  cursor: grabbing;
}

/* Override leaflet default styles */
.leaflet-container {
  background: transparent;
}

html.dark .leaflet-container {
  background: #0c1116;
}

/* html.dark .leaflet-tile-pane { */
/*   filter: brightness(0.8) contrast(1.1); */
/* } */

html:not(.dark) .leaflet-container {
  background: #eef5fc;
}

/* Pulsing outer ring animation - opacity only, no movement */
.pulse-ring {
  animation: pulse-ring 2s ease-in-out infinite;
}

@keyframes pulse-ring {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.15;
  }
}

/* Tooltip styles */
.location-tooltip {
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 500;
  color: #333;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.location-tooltip::before {
  border-top-color: rgba(255, 255, 255, 0.95);
}

html.dark .location-tooltip {
  background: rgba(30, 30, 30, 0.95);
  color: #eee;
}

html.dark .location-tooltip::before {
  border-top-color: rgba(30, 30, 30, 0.95);
}
</style>
