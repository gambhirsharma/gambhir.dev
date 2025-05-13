import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import UnoCSS from 'unocss/astro'
import vue from '@astrojs/vue'
import partytown from '@astrojs/partytown'
// import node from '@astrojs/node';
import vercel from '@astrojs/vercel'

export default defineConfig({
  site: 'https://gambhir.dev',
  server: {
    port: 3000,
  },
  adapter: vercel(),
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
  vite: {
    server: {
      allowedHosts: ['gambhir.xyz', 'gambhir.dev'],
      host: true,
    },
  },
})
