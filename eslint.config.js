import antfu from '@antfu/eslint-config'

export default antfu({
  vue: true,
  typescript: true,
  astro: true,
  formatters: {
    astro: true,
    css: true,
  },
  ignores: [
    'src/layouts/BaseLayout.astro',
    // agent worktrees (e.g. .claude/worktrees/*) are full repo copies, not our sources
    '.claude/**',
  ],
})
