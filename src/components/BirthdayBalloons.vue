<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { tsParticles } from '@tsparticles/engine'
import { loadSlim } from '@tsparticles/slim'

const props = defineProps<{
  birthday: string // 'YYYY-MM-DD'
}>()

const CONTAINER_ID = 'birthday-balloons'
let timer: ReturnType<typeof setTimeout> | undefined

function isBirthday(birthday: string): boolean {
  const [, month, day] = birthday.split('-').map(Number)
  const now = new Date()
  return now.getMonth() + 1 === month && now.getDate() === day
}

onMounted(async () => {
  if (!isBirthday(props.birthday))
    return

  await loadSlim(tsParticles)

  await tsParticles.load({
    id: CONTAINER_ID,
    options: {
      fullScreen: { enable: true, zIndex: 9999 },
      background: { opacity: 0 },
      fpsLimit: 60,
      particles: {
        number: { value: 0 },
        shape: {
          type: 'emoji',
          options: {
            emoji: {
              value: ['🎈', '🎈', '🎈', '🎉', '🎊'],
            },
          },
        },
        size: { value: { min: 20, max: 32 } },
        rotate: {
          value: { min: -15, max: 15 },
          animation: { enable: true, speed: 3, sync: false },
        },
        opacity: {
          value: { min: 0.7, max: 1 },
          animation: {
            enable: true,
            speed: 0.15,
            minimumValue: 0,
            destroy: 'min',
            startValue: 'max',
          },
        },
        move: {
          enable: true,
          direction: 'top',
          speed: { min: 1.5, max: 3.5 },
          random: true,
          straight: false,
          outModes: { default: 'destroy' },
          warp: false,
        },
        wobble: {
          enable: true,
          distance: 14,
          speed: { angle: 5, move: 3 },
        },
      },
      emitters: {
        direction: 'top',
        rate: { quantity: 3, delay: 0.35 },
        position: { x: 50, y: 105 },
        size: { width: 120, height: 0 },
        life: { duration: 9, count: 1 },
      },
    },
  })

  // clean up after animation finishes
  timer = setTimeout(async () => {
    const container = tsParticles.domItem(0)
    container?.destroy()
  }, 12000)
})

onUnmounted(() => {
  clearTimeout(timer)
  const container = tsParticles.domItem(0)
  container?.destroy()
})
</script>

<template>
  <div :id="CONTAINER_ID" />
</template>
