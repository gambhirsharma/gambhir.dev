# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `pnpm dev` — start dev server (astro dev --host), port 3000
- `pnpm build` — production build
- `pnpm preview` — preview production build
- `pnpm lint` — eslint check
- `pnpm lint:fix` — eslint autofix
- `pnpm release` — version bump via bumpp

No test suite exists in this repo.

Package manager is pnpm (implied by lint-staged/simple-git-hooks config). Pre-commit hook runs `pnpm lint-staged`, which runs `lint:fix` on all staged files — do not bypass with `--no-verify`.

## Architecture

Astro 5 site with Vue islands, MDX content collections, and UnoCSS for styling.

- **Content collections** (`src/content/config.ts`): `pages` and `blog` collections, schema-validated with zod. Blog posts live under `src/content/blog/` (including `notes/` and `talks/` subfolders); the `redirect`, `draft`, `video`, and `lang` frontmatter fields control per-post routing/visibility behavior — check usage in `src/pages/blog/` before assuming a field is unused.
- **Static data files** (`src/pages/*/data.ts`, `src/data/`): several sections (projects, open-source contributions, map locations) are driven by typed data files rather than content collections. Types for these live in `src/types.ts` (`ProjectData`, `OpenSourceData`, `HomePageData`). Add new entries by editing the relevant `data.ts`, not by creating new components.
- **Astro + Vue split**: `.astro` files handle layout/static structure; interactive bits (theme toggle, current time, scroll-to-top, birthday balloons, location map) are `.vue` components hydrated as islands.
- **Icons via UnoCSS `presetIcons`** (`uno.config.ts`): icons are plain class strings like `i-lucide-radar` or `i-ri-home-line`, resolved on-demand from `@iconify/json` — no import statement needed to use one. Icon names are stored as string values inside data files (e.g. `ProjectData.icon`), not written directly as class attributes in markup, so UnoCSS's static scanner cannot see them and will not generate the CSS. **Any icon referenced only from a `data.ts`/`.ts` file must be added to the `safelist` array in `uno.config.ts`, or it silently renders nothing.** Icons used directly as a class in `.astro`/`.vue` templates don't need safelisting.
- **Deployment target**: `site: 'https://gambhir.dev'` in `astro.config.ts`; sitemap and Partytown (for forwarding `dataLayer.push`) integrations are wired at the config level.
