<script lang="ts" setup>
import { useWindowScroll } from '@vueuse/core'
import { computed, onMounted, onUnmounted, ref, unref, watch } from 'vue'
import ThemeToggle from './ThemeToggle.vue'
import siteConfig from '@/site-config'
import { getLinkTarget } from '@/utils/link'

const props = defineProps<{
  currentPath?: string
}>()

const navLinks = siteConfig.header.navLinks || []

// The nav link whose href is the longest prefix of the current path, so
// /blog/notes/ highlights "Notes" rather than "Blog"
const activeHref = computed(() => {
  const path = (props.currentPath || '').replace(/\/$/, '') || '/'
  return navLinks
    .filter(link => path === link.href || path.startsWith(`${link.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href
})

// Links flagged with `header` show as icons in the desktop header, using the
// `header` icon when it is one. Copies, so siteConfig keeps its brand icons
// for the drawer.
const socialLinks = siteConfig.socialLinks
  .filter((link: Record<string, any>) => link.header)
  .map((link: Record<string, any>) => ({
    ...link,
    icon: typeof link.header === 'string' && link.header.includes('i-') ? link.header : link.icon,
  }))

// Mobile side drawer: nav links plus every social link
const drawerOpen = ref(false)

function closeDrawer() {
  drawerOpen.value = false
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape')
    closeDrawer()
}

// lock page scroll behind the open drawer
watch(drawerOpen, (open) => {
  document.documentElement.style.overflow = open ? 'hidden' : ''
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  document.documentElement.style.overflow = ''
})

const { y: scroll } = useWindowScroll()

const oldScroll = ref(unref(scroll))

onMounted(() => {
  document.addEventListener('keydown', onKeydown)

  const headerEl = document.querySelector('#header') as HTMLElement
  if (!headerEl)
    return

  if (document.documentElement.scrollTop > 100)
    headerEl.classList.add('header-bg-blur')

  window.addEventListener('scroll', () => {
    if (scroll.value < 150) {
      headerEl.classList.remove('header-hide')
      return
    }

    if (scroll.value - oldScroll.value > 150) {
      headerEl.classList.add('header-hide')
      oldScroll.value = scroll.value
    }

    if (oldScroll.value - scroll.value > 150) {
      headerEl.classList.remove('header-hide')
      oldScroll.value = scroll.value
    }
  })
})
</script>

<template>
  <header
    id="header" :class="{ 'header-bg-blur': scroll > 20 }"
    view-transition-name="site-header"
    class="!fixed bg-transparent z-899 w-screen header-bar"
  >
    <div class="header-start">
      <button
        class="header-link header-icon menu-button" aria-label="Open menu" aria-controls="nav-drawer"
        :aria-expanded="drawerOpen" @click="drawerOpen = true"
      >
        <i i-ri-menu-2-fill />
      </button>
      <a href="/" class="logo" aria-label="Home">
        gambhir.dev <span title="Wave">🌊</span>
      </a>
      <nav class="header-nav">
        <a
          v-for="link in navLinks" :key="link.text" :aria-label="`${link.text}`" :target="getLinkTarget(link.href)"
          class="header-link nav-item" :class="{ active: link.href === activeHref }" :href="link.href"
          :aria-current="link.href === activeHref ? 'page' : undefined"
        >
          {{ link.text }}
        </a>
      </nav>
    </div>
    <div class="header-icons">
      <a
        v-for="link in socialLinks" :key="link.text" :aria-label="`${link.text}`" class="header-link header-icon desktop-only"
        :target="getLinkTarget(link.href)" :href="link.href"
      >
        <i :class="link.icon" />
      </a>
      <a class="header-link header-icon desktop-only" target="_blank" href="/rss.xml" aria-label="RSS">
        <i i-ri-rss-line />
      </a>
      <ThemeToggle class="header-link header-icon" />
    </div>
  </header>

  <div class="drawer-mask" :class="{ open: drawerOpen }" @click="closeDrawer" />
  <aside id="nav-drawer" class="drawer" :class="{ open: drawerOpen }" :inert="!drawerOpen" aria-label="Menu">
    <div class="drawer-head">
      <a href="/" class="logo" @click="closeDrawer">gambhir.dev <span title="Wave">🌊</span></a>
      <button class="header-link header-icon" aria-label="Close menu" @click="closeDrawer">
        <i i-ri-close-line />
      </button>
    </div>
    <nav class="drawer-nav">
      <a
        v-for="link in navLinks" :key="link.text" :target="getLinkTarget(link.href)" :href="link.href"
        class="header-link" :class="{ active: link.href === activeHref }"
        :aria-current="link.href === activeHref ? 'page' : undefined" @click="closeDrawer"
      >
        {{ link.text }}
      </a>
    </nav>
    <div class="drawer-social">
      <span class="drawer-label">elsewhere</span>
      <a
        v-for="link in siteConfig.socialLinks" :key="link.text" class="header-link"
        :target="getLinkTarget(link.href)" :href="link.href"
      >
        <i :class="link.icon" />{{ link.text }}
      </a>
      <a class="header-link" target="_blank" href="/rss.xml">
        <i i-simple-icons-rss />RSS
      </a>
    </div>
  </aside>
</template>

<style scoped>
.header-hide {
  transform: translateY(-100%);
  transition: transform 0.4s ease;
}

.header-bg-blur {
  --at-apply: backdrop-blur-sm;
}

.header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: clamp(20px, 4vw, 28px) clamp(20px, 5vw, 64px);
}

.header-start {
  display: flex;
  align-items: center;
  gap: 16px clamp(24px, 5vw, 56px);
}

.logo {
  font-size: 19px;
  font-weight: 600;
  white-space: nowrap;
  color: var(--c-text);
}

/* Small screens: menu button + logo + theme toggle; the nav and social
   links live in the side drawer instead. (Two-class selectors so these win
   over .header-icon's display.) */
.header-nav,
.header-icon.desktop-only {
  display: none;
}

.header-icon.menu-button {
  margin-right: -6px;
}

@media (min-width: 640px) {
  .header-nav {
    display: flex;
    flex-wrap: wrap;
    gap: 8px clamp(16px, 3vw, 24px);
    font-size: 16px;
  }

  .header-icon.desktop-only {
    display: flex;
  }

  .header-icon.menu-button {
    display: none;
  }
}

.nav-item {
  white-space: nowrap;
  text-decoration: underline 2px transparent;
  text-underline-offset: 8px;
  transition:
    color 0.2s,
    text-decoration-color 0.2s;
}

.nav-item.active {
  color: var(--c-strong);
  text-decoration-color: var(--c-accent);
}

.header-icons {
  display: flex;
  align-items: center;
  gap: 26px;
}

.header-link {
  color: var(--c-secondary);
  transition:
    color 0.2s,
    background-color 0.2s;
}

.header-link:hover {
  color: var(--c-strong);
}

.header-icon {
  display: flex;
  padding: 6px;
  margin: -6px;
  border-radius: 6px;
}

.header-icon:hover {
  background: var(--c-hover);
}

.header-icon :deep(i) {
  width: 18px;
  height: 18px;
}

/* side drawer */
.drawer-mask {
  position: fixed;
  inset: 0;
  z-index: 998;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s;
}

.drawer-mask.open {
  opacity: 1;
  pointer-events: auto;
}

.drawer {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
  display: flex;
  flex-direction: column;
  gap: 28px;
  width: min(280px, 82vw);
  height: 100dvh;
  padding: 20px;
  box-sizing: border-box;
  overflow-y: auto;
  background: var(--c-bg);
  border-right: 1px solid var(--c-border);
  transform: translateX(-100%);
  transition: transform 0.25s ease;
}

.drawer.open {
  transform: translateX(0);
}

.drawer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.drawer-nav,
.drawer-social {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.drawer-nav a,
.drawer-social a {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 -12px;
  padding: 9px 12px;
  border-left: 2px solid transparent;
  border-radius: 0 6px 6px 0;
}

.drawer-nav a {
  font-size: 17px;
}

.drawer-nav a:hover,
.drawer-social a:hover {
  background: var(--c-hover);
}

.drawer-nav a.active {
  color: var(--c-strong);
  border-left-color: var(--c-accent);
  background: var(--c-hover-row);
}

.drawer-social {
  padding-top: 20px;
  border-top: 1px solid var(--c-border-row);
  font-size: 15px;
}

.drawer-social i {
  width: 16px;
  height: 16px;
}

.drawer-label {
  margin-bottom: 6px;
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--c-tertiary);
}

@media (min-width: 640px) {
  .drawer,
  .drawer-mask {
    display: none;
  }
}
</style>
