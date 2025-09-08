import type { HomePageData } from '@/types'

export const HomeData: HomePageData = {
  project: [
    {
      title: 'OnFly Image Optimization',
      description: 'An self host image optmimization',
      techstack: ['Nextjs', 'k8s', 'TypeScipt'],
      url: 'https://github.com/gambhirsharma/OnFly-Image-Optimization',
    },
    {
      title: 'craft.gambhir.dev',
      description: 'Crative coding, codepen that I created',
      techstack: ['PUG', 'SASS', 'Style'],
      url: 'https://craft.gambhir.dev',
    },
  ],
  work: [
    // {
    //   title: 'CGI',
    //   position: 'DevOps Intern',
    //   duration: {
    //     start: new Date('2025-09-01'),
    //     end: 'Present',
    //   },
    //   description: 'got hand on experience on production scale kubernetes cluster',
    // },
    {
      title: 'MIMPI',
      position: 'Sofrware Engineer Intern',
      duration: {
        start: new Date('2025-04-01'),
        end: new Date('2025-06-01'),
      },
      description: 'worked on the Flutter & Full stack website',
    },
    {
      title: 'RepoCraft',
      position: 'Software Engineer',
      duration: {
        start: new Date('2023-06-01'),
        end: new Date('2024-02-01'),
      },
      description: 'contributed to repoCraft, enhancing both frontend and backend',
    },

  ],
}
