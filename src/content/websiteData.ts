import type { HomePageData } from '@/types'

export const HomeData: HomePageData = {
  project: [
    {
      title: 'OnFly Image Optimization',
      description: 'a self-hosted image optimization service',
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
      position: 'devops eng',
      duration: {
        start: new Date('2025-09-01'),
        end: 'present',
      },
      description: 'got hand on experience on production scale kubernetes cluster',
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
      position: 'swe',
      duration: {
        start: new Date('2023-06-01'),
        end: new Date('2024-02-01'),
      },
      description: 'contributed to repocraft, enhancing both frontend and backend',
    },

  ],
}
