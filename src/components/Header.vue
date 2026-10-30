<script lang="ts" setup>
import { useWindowScroll } from '@vueuse/core'
import { computed, onMounted, ref, unref } from 'vue'
import ThemeToggle from './ThemeToggle.vue'
import siteConfig from '@/site-config'
import { getLinkTarget } from '@/utils/link'

const navLinks = siteConfig.header.navLinks || []

const socialLinks = computed(() => {
  return siteConfig.socialLinks.filter((link: Record<string, any>) => {
    if (link.header && typeof link.header === 'boolean') {
      return link
    }
    else if (link.header && typeof link.header === 'string') {
      link.icon = link.header.includes('i-') ? link.header : link.icon
      return link
    }
    else {
      return false
    }
  })
})

const { y: scroll } = useWindowScroll()

const oldScroll = ref(unref(scroll))

onMounted(() => {
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
    <a href="/" class="logo" aria-label="Home">
      gambhir.dev <span title="Wave">🌊</span>
    </a>
    <nav class="header-nav">
      <a
        v-for="link in navLinks" :key="link.text" :aria-label="`${link.text}`" :target="getLinkTarget(link.href)"
        class="header-link" :href="link.href"
      >
        {{ link.text }}
      </a>
    </nav>
    <div class="header-icons">
      <a
        v-for="link in socialLinks" :key="link.text" :aria-label="`${link.text}`" class="header-link header-icon"
        :target="getLinkTarget(link.href)" :href="link.href"
      >
        <i :class="link.icon" />
      </a>
      <a class="header-link header-icon" target="_blank" href="/rss.xml" aria-label="RSS">
        <i i-ri-rss-line />
      </a>
      <ThemeToggle class="header-link header-icon" />
    </div>
  </header>
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
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px clamp(24px, 5vw, 56px);
  padding: clamp(20px, 4vw, 28px) clamp(20px, 5vw, 64px);
}

.logo {
  font-size: 19px;
  font-weight: 600;
  white-space: nowrap;
  color: var(--c-text);
}

/* On small screens the nav gets its own row under the logo and icons */
.header-nav {
  order: 2;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 8px clamp(16px, 3vw, 24px);
  font-size: 16px;
}

@media (min-width: 640px) {
  .header-nav {
    order: 0;
    width: auto;
    margin-right: auto;
  }
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
</style>
