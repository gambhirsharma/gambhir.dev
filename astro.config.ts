import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import UnoCSS from 'unocss/astro'
import vue from '@astrojs/vue'
import partytown from '@astrojs/partytown'

export default defineConfig({
  site: 'https://gambhir.dev',
  server: {
    port: 3000,
  },
  redirects: {
    // GitHub — canonical + common typo the user requested + short alias
    '/github': 'https://github.com/gambhirsharma',
    '/gihtub': 'https://github.com/gambhirsharma',
    '/gihub': 'https://github.com/gambhirsharma',
    '/gh': 'https://github.com/gambhirsharma',
    // X / Twitter
    '/twitter': 'https://x.com/gambhir_sharma',
    '/x': 'https://x.com/gambhir_sharma',
    // LinkedIn
    '/linkedin': 'https://www.linkedin.com/in/gambhir-sharma/',
    '/in': 'https://www.linkedin.com/in/gambhir-sharma/',
    '/li': 'https://www.linkedin.com/in/gambhir-sharma/',
    // CodePen
    '/codepen': 'https://www.codepen.io/gambhirsharma',
    // Mastodon
    '/mastodon': 'https://mastodon.social/@gambhir',
    // Discord
    '/discord': 'https://discord.com',
    // Bluesky
    '/bsky': 'https://bsky.app/profile/gambhirsharma.bsky.social',
    '/bluesky': 'https://bsky.app/profile/gambhirsharma.bsky.social',
    // VPS bootstrap — single entrypoint (clones vps-setup repo)
    '/install': '/install.sh',
    '/bootstrap': '/bootstrap.sh',
    '/vps-setup': '/vps-setup.sh',
    // legacy: nvim-setup.sh removed — redirect to bootstrap (use --no-vps for nvim-only)
    '/nvim': '/install.sh',
    '/nvim.sh': '/install.sh',
    '/nvim-setup.sh': '/install.sh',
  },
  integrations: [
    mdx(),
    sitemap(),
    UnoCSS({
      injectReset: true,
    }),
    vue(),
    partytown({
      config: {
        forward: ['dataLayer.push'],
      },
    }),
  ],
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light-default',
        dark: 'aurora-x',
      },
      wrap: true,
    },
  },

})
