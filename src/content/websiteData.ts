import type { HomePageData } from '@/types'

export const HomeData: HomePageData = {
  project: [
    {
      title: 'OnFly Image Optimization',
      description: 'a self-hosted onfly image optimization service',
      techstack: ['Nextjs', 'k8s', 'TypeScipt'],
      url: 'https://github.com/gambhirsharma/OnFly-Image-Optimization',
    },
    {
      title: 'craft.gambhir.dev',
      description: 'crative coding, codepen that I created',
      techstack: ['PUG', 'SASS', 'Style'],
      url: 'https://craft.gambhir.dev',
    },
  ],
  work: [
    {
      title: 'CGI',
      position: 'devops eng space',
      duration: {
        start: new Date('2025-09-01'),
        end: new Date('2026-03-31'),
      },
      description: 'scaling earth observation platforms',
    },
    {
      title: 'MIMPI',
      position: 'swe intern',
      duration: {
        start: new Date('2025-04-01'),
        end: new Date('2025-06-01'),
      },
      description: 'worked on the flutter & full stack website',
    },
    {
      title: 'RepoCraft',
      position: 'swe | web-dev',
      duration: {
        start: new Date('2023-06-01'),
        end: new Date('2024-02-01'),
      },
      description: 'all-in-one dependency installer',
    },

  ],
}
