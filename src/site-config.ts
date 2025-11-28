export const siteConfig = {
  author: 'Gambhir Sharma ⚡',
  title: 'Gambhir Sharma',
  subtitle: 'presonal blog',
  description: 'Personal website and blog of Gambhir Sharma',
  image: {
    src: '/OG.png',
    alt: 'Website Main Image',
  },
  email: 'gambhiritaly@gmail.com',
  emailDisplay: 'gambhir<country of 🍕>@gmail.com',
  socialLinks: [
    {
      text: 'GitHub',
      href: 'https://www.github.com/gambhirsharma',
      icon: 'i-simple-icons-github',
      header: 'i-ri-github-line',
    },
    {
      text: 'Twitter',
      href: 'https://www.twitter.com/gambhir_sharma',
      icon: 'i-simple-icons-x',
      header: 'i-ri-twitter-x-line',
    },
    {
      text: 'Linkedin',
      href: 'https://www.linkedin.com/in/gambhir-sharma/',
      icon: 'i-simple-icons-linkedin',
    },
    // {
    //  text: 'Discord',
    //  href: '',
    //  icon: 'i-simple-icons-discord',
    // },
  ],
  header: {
    logo: {
      src: '/favicon.png',
      alt: 'Logo Image',
    },
    navLinks: [
      {
        text: 'Blog',
        href: '/blog',
      },
      {
        text: 'Notes',
        href: '/blog/notes',
      },
      {
        text: 'Talks',
        href: '/blog/talks',
      },
      {
        text: 'Projects',
        href: '/projects',
      },
    ],
  },
  page: {
    blogLinks: [
      {
        text: 'Blog',
        href: '/blog',
      },
      {
        text: 'Notes',
        href: '/blog/notes',
      },
      {
        text: 'Talks',
        href: '/blog/talks',
      },
    ],
  },
  footer: {
    navLinks: [
      {
        text: 'Posts Props',
        href: '/posts-props',
      },
      {
        text: 'Markdown Style',
        href: '/md-style',
      },
      {
        text: 'View on Astro',
        href: 'https://astro.build/themes/details/vitesse-theme-for-astro/',
      },
      {
        text: 'GitHub Repository',
        href: 'https://github.com/kevinwong865/astro-theme-vitesse',
      },
    ],
  },
}

export default siteConfig
