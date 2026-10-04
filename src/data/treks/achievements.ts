import type { TrekStats } from '@/data/treks'

export interface Achievement {
  title: string
  description: string
  icon: string // UnoCSS icon class, auto-safelisted in uno.config.ts
  target: number
  unit?: string
  // Current progress towards `target`; unlocked once it reaches the target
  progress: (stats: TrekStats) => number
}

// To add an achievement: add an entry here. Locked ones show greyed out with progress.
export const achievements: Achievement[] = [
  {
    title: 'First Steps',
    description: 'Complete your first trek',
    icon: 'i-lucide-footprints',
    target: 1,
    unit: 'trek',
    progress: s => s.count,
  },
  {
    title: 'Double Digits',
    description: 'Walk 10 km in a single trek',
    icon: 'i-lucide-route',
    target: 10,
    unit: 'km',
    progress: s => s.longestTrekKm,
  },
  {
    title: 'Back to Back',
    description: 'Trek on two consecutive days',
    icon: 'i-lucide-calendar-check',
    target: 2,
    unit: 'days',
    progress: s => s.longestStreakDays,
  },
  {
    title: 'Vertical Kilometre',
    description: 'Climb 1,000 m in total',
    icon: 'i-lucide-mountain',
    target: 1000,
    unit: 'm',
    progress: s => s.totalElevationGainM,
  },
  {
    title: 'Above the Clouds',
    description: 'Reach 1,000 m altitude',
    icon: 'i-lucide-cloud',
    target: 1000,
    unit: 'm',
    progress: s => s.highestPointM,
  },
  {
    title: 'Marathon Legs',
    description: 'Walk a marathon (42.2 km) in total',
    icon: 'i-lucide-medal',
    target: 42.2,
    unit: 'km',
    progress: s => s.totalDistanceKm,
  },
  {
    title: 'Trailblazer',
    description: 'Complete 10 treks',
    icon: 'i-lucide-map-pinned',
    target: 10,
    unit: 'treks',
    progress: s => s.count,
  },
  {
    title: 'Century',
    description: 'Walk 100 km in total',
    icon: 'i-lucide-trophy',
    target: 100,
    unit: 'km',
    progress: s => s.totalDistanceKm,
  },
  {
    title: 'Everest',
    description: 'Climb the height of Everest (8,849 m) in total',
    icon: 'i-lucide-mountain-snow',
    target: 8849,
    unit: 'm',
    progress: s => s.totalElevationGainM,
  },
]

export default achievements
