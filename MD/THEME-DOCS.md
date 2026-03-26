# Gambhir.dev Theme Documentation

This document contains all the types, configurations, and styling needed to replicate this website in another project.

## Project Overview

- **Framework**: Astro 5.x with Vue integration
- **Styling**: UnoCSS with custom presets
- **TypeScript**: Full type safety
- **Icons**: Iconify (via UnoCSS preset)

## Dependencies

```json
{
  "dependencies": {
    "@astrojs/mdx": "^4.3.0",
    "@astrojs/partytown": "^2.1.4",
    "@astrojs/rss": "^4.0.12",
    "@astrojs/sitemap": "^3.4.1",
    "@astrojs/vue": "^5.1.0",
    "@unocss/reset": "^0.61.9",
    "astro": "^5.11.0",
    "leaflet": "^1.9.4",
    "nprogress": "^0.2.0",
    "unocss": "^0.61.9",
    "vue": "^3.5.13"
  },
  "devDependencies": {
    "@antfu/eslint-config": "^2.27.3",
    "@iconify/json": "^2.2.336",
    "@types/leaflet": "^1.9.21",
    "@types/lodash-es": "^4.17.12",
    "@types/nprogress": "^0.2.3",
    "@vueuse/core": "^10.11.1",
    "bumpp": "^9.11.1",
    "eslint": "^8.57.1",
    "eslint-plugin-astro": "^1.3.1",
    "eslint-plugin-format": "^0.1.3",
    "lint-staged": "^15.5.2",
    "lodash-es": "^4.17.21",
    "prettier-plugin-astro": "^0.13.0",
    "simple-git-hooks": "^2.13.0"
  }
}
```

---

## TypeScript Types

### `/src/types.ts`

```typescript
import type { CollectionEntry } from 'astro:content'

export type PostKey = 'blog'

export type CollectionPosts = CollectionEntry<PostKey>

export type Pages = 'pages'

export type CollectionPages = CollectionEntry<Pages>

export type ProjectData = Array<{
  title: string
  projects: Array<{
    text: string
    description?: string
    icon?: string
    href: string
  }>
}>

export interface HomePageData {
  project: Array<{
    title: string
    description: string
    techstack: Array<string>
    url: string
  }>
  work: Array<{
    title: string
    position: string
    duration: {
      start: Date
      end: Date | 'present'
    }
    description: string
  }>
}

export interface OpenSourceContribution {
  repo: string
  repoUrl: string
  prTitle: string
  techStack: string[]
  prNumber: number
  prUrl: string
  status: 'merged' | 'open' | 'closed'
}

export type OpenSourceData = OpenSourceContribution[]
```

---

## UnoCSS Configuration

### `/uno.config.ts`

```typescript
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  shortcuts: [
    {
      'bg-main': 'bg-hex-eef5fc dark:bg-hex-0d1117',
      'text-main': 'text-hex-555555 dark:text-hex-bbbbbb',
      'text-link': 'text-dark dark:text-white ',
      'border-main': 'border-truegray-300 dark:border-truegray-600',
    },
    {
      'text-title': 'text-link text-4xl font-800',
      'nav-link': 'text-link opacity-70 hover:opacity-100 transition-opacity duration-200 cursor-pointer',
      'prose-link': 'text-link text-nowrap cursor-pointer border-b-1 !border-opacity-30 hover:!border-opacity-100 border-neutral-500 hover:border-truegray-600 dark:border-neutral-500 hover:dark:border-truegray-400 transition-border-color duration-200 decoration-none',
      'container-link': 'p-2 opacity-60 hover:opacity-100 cursor-pointer hover:bg-truegray-500 !bg-opacity-10 transition-colors transition-opacity duration-200',
    },
    {
      'hr-line': 'w-14 mx-auto my-8 border-solid border-1px !border-truegray-200 !dark:border-truegray-800',
    },
  ],
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      prefix: 'i-',
      extraProperties: {
        display: 'inline-block',
      },
    }),
    presetTypography(),
    presetWebFonts({
      fonts: {
        sans: 'Inter:400,600,800',
        mono: 'DM Mono:400,600',
      },
    }),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  safelist: [
    'i-ri-file-list-2-line',
    'i-carbon-campsite',
    'i-simple-icons-github',
    'i-simple-icons-x',
    'i-simple-icons-linkedin',
    'i-simple-icons-discord',
    'i-simple-icons-instagram',
    'i-simple-icons-youtube',
    'i-simple-icons-bilibili',
    'i-simple-icons-zhihu',
    'i-simple-icons-sinaweibo',
    'i-ri-github-line',
    'i-ri-twitter-x-line',
    'i-ri-brush-4-line',
    'i-ri-image-ai-line',
    'i-ri-macbook-line',
    'i-ri-nft-line',
    'i-hugeicons-arrow-right-02',
    'i-lucide-columns-settings',
    'i-lucide-images',
    'i-lucide-server-cog',
    'i-mingcute-fitness-line',
    'i-fluent-food-16-regular',
    'i-hugeicons-blush-brush-02',
  ],
})
```

---

## Site Configuration

### `/src/site-config.ts`

```typescript
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
  location: {
    place: 'Rome, Italy',
    timeZone: 'Europe/Rome',
  },
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
  ],
  header: {
    logo: {
      src: '/favicon.png',
      alt: 'Logo Image',
    },
    navLinks: [
      { text: 'Blog', href: '/blog' },
      { text: 'Notes', href: '/blog/notes' },
      { text: 'Talks', href: '/blog/talks' },
      { text: 'Projects', href: '/projects' },
    ],
  },
  page: {
    blogLinks: [
      { text: 'Blog', href: '/blog' },
      { text: 'Notes', href: '/blog/notes' },
      { text: 'Talks', href: '/blog/talks' },
    ],
  },
  footer: {
    navLinks: [
      { text: 'Posts Props', href: '/posts-props' },
      { text: 'Markdown Style', href: '/md-style' },
      { text: 'View on Astro', href: 'https://astro.build/themes/details/vitesse-theme-for-astro/' },
      { text: 'GitHub Repository', href: 'https://github.com/kevinwong865/astro-theme-vitesse' },
    ],
  },
}
```

---

## Global CSS

### `/src/styles/global.css`

```css
html.dark .astro-code,
html.dark .astro-code span {
  color: var(--shiki-dark) !important;
  background-color: #161b22 !important;
  font-style: var(--shiki-dark-font-style) !important;
  font-weight: var(--shiki-dark-font-weight) !important;
  text-decoration: var(--shiki-dark-text-decoration) !important;
}

html.dark {
  color-scheme: dark;
}

html:not(.dark) {
  color-scheme: light;
}

#nprogress {
  pointer-events: none;
}

#nprogress .bar {
  background: #888;
  opacity: 0.75;
  position: fixed;
  z-index: 999;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
}

img {
  --at-apply: rd-1.5;
}

article {
  --at-apply: sm: min-h-38 min-h-28;
}

.prose-link i {
  --at-apply: text-sm mr-1;
}

::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

::view-transition-old(root) {
  z-index: 1;
}

::view-transition-new(root) {
  z-index: 2147483646;
}

html.dark::view-transition-old(root) {
  z-index: 2147483646;
}
html.dark::view-transition-new(root) {
  z-index: 1;
}

/* The time component */
html.dark {
  --current_time_bg-color: #161b22;
  --current_time_text-color: #42b983;
  --text-primary-green-color: #42b983;
}

html:not(.dark) {
  --current_time_bg-color: #ffffff;
  --current_time_text-color: #161b22;
  --text-primary-green-color: #42b983;
}

html.dark {
  #hero-img {
    content: url('/hero.png');
  }
}
html:not(dark) {
  #hero-img {
    content: url('/wave.png');
  }
}
```

---

## Prose/Markdown Styling

### `/src/styles/prose.css`

```css
.prose {
  --at-apply: text-base lh-1.75 mb-16 max-w-none sm: min-h-50vh min-h-38vh;
}
.prose a {
  --at-apply: prose-link;
}
.prose a:hover {
  cursor:
    url('/kela.svg') 5 7,
    pointer;
}
.prose strong {
  font-weight: 600;
}
.prose ol[type='A'] {
  --list-counter-style: upper-alpha;
}
.prose ol[type='a'] {
  --list-counter-style: lower-alpha;
}
.prose ol[type='A s'] {
  --list-counter-style: upper-alpha;
}
.prose ol[type='a s'] {
  --list-counter-style: lower-alpha;
}
.prose ol[type='I'] {
  --list-counter-style: upper-roman;
}
.prose ol[type='i'] {
  --list-counter-style: lower-roman;
}
.prose ol[type='I s'] {
  --list-counter-style: upper-roman;
}
.prose ol[type='i s'] {
  --list-counter-style: lower-roman;
}
.prose ol[type='1'] {
  --list-counter-style: decimal;
}
.prose ol > li {
  position: relative;
  padding-left: 1.75em;
}
.prose ol > li::before {
  content: counter(list-item, var(--list-counter-style, decimal)) '.';
  position: absolute;
  font-weight: 400;
  color: #6b7280;
  left: 0;
}
.prose ul > li {
  position: relative;
  padding-left: 1.75em;
}
.prose ul > li::before {
  content: '';
  position: absolute;
  background-color: #d1d5db;
  border-radius: 50%;
  width: 0.375em;
  height: 0.375em;
  top: calc(0.875em - 0.1875em);
  left: 0.25em;
}
.prose hr {
  border-color: rgba(125, 125, 125, 0.3);
  margin-top: 3em;
  margin-bottom: 3em;
  height: 2px;
  width: 100%;
  background-color: rgba(125, 125, 125, 0.3);
}
.prose blockquote {
  font-weight: 500;
  font-style: italic;
  color: inherit;
  border-left-width: 0.25rem;
  border-color: rgba(125, 125, 125, 0.3);
  quotes: '\201C' '\201D' '\2018' '\2019';
  margin-top: 1.6em;
  margin-bottom: 1.6em;
  padding-left: 1em;
}
.prose blockquote p {
  border-left: 4px solid #42b983;
  padding-left: 1em;
  color: #555;
  font-style: italic;
  background: #f9f9f9;
}
html.dark .prose blockquote p {
  background-color: #121212;
}
.prose h1 {
  font-weight: 800;
  font-size: 2.25em;
  margin-top: 0;
  margin-bottom: 0.8888889em;
  line-height: 1.1111111;
}
.prose h2 {
  font-weight: 700;
  font-size: 1.5em;
  margin-top: 2em;
  margin-bottom: 1em;
  line-height: 1.3333333;
}
.prose h3 {
  color: inherit;
  font-weight: 600;
  font-size: 1.25em;
  margin-top: 1.6em;
  margin-bottom: 0.6em;
  line-height: 1.6;
  opacity: 0.7;
}
.prose code {
  background-color: #e0e4e7;
  font-weight: 600;
  font-size: 0.875em;
  border-radius: 4px;
  font-family: monospace;
  padding: 0.25em 0.3em;
}
html.dark code {
  background-color: #202731;
}
.prose pre {
  color: #e5e7eb;
  overflow-x: auto;
  font-size: 0.875em;
  line-height: 1.7142857;
  margin-top: 1.7142857em;
  margin-bottom: 1.7142857em;
  border-radius: 0.375rem;
  padding: 0.8571429em 1.1428571em;
}
.prose pre code {
  background-color: transparent;
  border-width: 0;
  border-radius: 0;
  padding: 0;
  font-weight: 400;
  color: inherit;
  font-size: inherit;
  font-family: inherit;
  line-height: inherit;
}
.prose table {
  width: 100%;
  table-layout: auto;
  text-align: left;
  margin-top: 2em;
  margin-bottom: 2em;
  font-size: 0.875em;
  line-height: 1.7142857;
}
.prose thead {
  font-weight: 600;
  border-bottom-width: 1px;
  border-bottom-color: #8882;
}
.prose tbody tr {
  border-bottom-width: 1px;
  border-bottom-color: #8882;
}
.prose h6 {
  text-transform: uppercase;
  margin-top: 20px;
  margin-bottom: 10px;
  opacity: 0.5;
  font-weight: 500;
  letter-spacing: 2px;
}
```

---

## Available Icons (Safelist)

These are the icons available for use with the `i-` prefix:

| Icon Class | Source |
|------------|--------|
| `i-ri-file-list-2-line` | Remix Icon |
| `i-carbon-campsite` | Carbon |
| `i-simple-icons-github` | Simple Icons |
| `i-simple-icons-x` | Simple Icons |
| `i-simple-icons-linkedin` | Simple Icons |
| `i-simple-icons-discord` | Simple Icons |
| `i-simple-icons-instagram` | Simple Icons |
| `i-simple-icons-youtube` | Simple Icons |
| `i-simple-icons-bilibili` | Simple Icons |
| `i-simple-icons-zhihu` | Simple Icons |
| `i-simple-icons-sinaweibo` | Simple Icons |
| `i-ri-github-line` | Remix Icon |
| `i-ri-twitter-x-line` | Remix Icon |
| `i-ri-brush-4-line` | Remix Icon |
| `i-ri-image-ai-line` | Remix Icon |
| `i-ri-macbook-line` | Remix Icon |
| `i-ri-nft-line` | Remix Icon |
| `i-hugeicons-arrow-right-02` | Huge Icons |
| `i-lucide-columns-settings` | Lucide |
| `i-lucide-images` | Lucide |
| `i-lucide-server-cog` | Lucide |
| `i-mingcute-fitness-line` | MingCute |
| `i-fluent-food-16-regular` | Fluent UI |
| `i-hugeicons-blush-brush-02` | Huge Icons |

---

## Theme Colors

### Light Mode
- Background: `#eef5fc`
- Text Primary: `#555555`
- Border: `#truegray-300`

### Dark Mode
- Background: `#0d1117`
- Text Primary: `#bbbbbb`
- Border: `#truegray-600`

### Accent Colors
- Primary Green: `#42b983`
- Code Background (dark): `#161b22`
- Code Background (light): `#e0e4e7`

---

## CSS Shorthands (UnoCSS Shortcuts)

| Shortcut | CSS |
|----------|-----|
| `bg-main` | Background color (light/dark) |
| `text-main` | Text color (light/dark) |
| `text-link` | Link text color |
| `border-main` | Border color |
| `text-title` | Title styling (4xl, 800 weight) |
| `nav-link` | Navigation link styling |
| `prose-link` | Prose link styling |
| `container-link` | Container link styling |
| `hr-line` | Horizontal line styling |

---

## Astro Configuration

### `/astro.config.ts` (basic structure)

```typescript
import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import partytown from '@astrojs/partytown'
import sitemap from '@astrojs/sitemap'
import vue from '@astrojs/vue'
import UnoCSS from 'unocss/astro'

export default defineConfig({
  site: 'https://gambhir.dev',
  integrations: [
    UnoCSS(),
    vue(),
    mdx(),
    sitemap(),
    partytown(),
  ],
})
```
