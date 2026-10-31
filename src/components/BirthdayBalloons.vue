<script setup lang="ts">
import { onMounted } from 'vue'

const props = defineProps<{
  birthday: string // 'YYYY-MM-DD'
}>()

function isBirthday(birthday: string): boolean {
  const [, month, day] = birthday.split('-').map(Number)
  const now = new Date()
  return now.getMonth() + 1 === month && now.getDate() === day
}

onMounted(async () => {
  if (!isBirthday(props.birthday))
    return

  // Only pay for canvas-confetti on the one day a year it is actually used
  const { default: confetti } = await import('canvas-confetti')
  confetti({ particleCount: 200, spread: 160, origin: { y: 0.6 }, startVelocity: 55, zIndex: 9999 })
})
</script>

<template>
  <div />
</template>
