<script lang="ts" setup>
import siteConfig from '@/site-config'
</script>

<template>
  <footer class="site-footer w-full mt-12 pb-8 flex justify-between flex-wrap gap-3">
    <span>&copy; {{ new Date().getFullYear() }} {{ siteConfig.title }}</span>
    <a href="#">back to top ↑</a>
  </footer>
</template>

<style scoped>
.site-footer {
  font-size: 13px;
  color: var(--c-tertiary);
}

.site-footer a {
  color: var(--c-tertiary);
  transition: color 0.2s;
}

.site-footer a:hover {
  color: var(--c-strong);
}
</style>
