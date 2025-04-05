import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import UnoCSS from 'unocss/astro'
import vue from '@astrojs/vue'
import partytown from '@astrojs/partytown';

export default defineConfig({
  site: 'https://gambhir.xyz',
  server: {
    port: 3000,
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
        forward: ['dataLayer.push'] 
      } 
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
