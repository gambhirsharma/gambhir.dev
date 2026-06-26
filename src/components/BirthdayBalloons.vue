<script setup lang="ts">
import { onMounted } from 'vue'
import confetti from 'canvas-confetti'

const props = defineProps<{
  birthday: string // 'YYYY-MM-DD'
}>()

function isBirthday(birthday: string): boolean {
  const [, month, day] = birthday.split('-').map(Number)
  const now = new Date()
  return now.getMonth() + 1 === month && now.getDate() === day
}

function fire(opts: confetti.Options) {
  confetti({ zIndex: 9999, ...opts })
}

onMounted(() => {
  if (!isBirthday(props.birthday))
    return

  // initial burst from center
  fire({ particleCount: 120, spread: 100, origin: { y: 0.6 }, startVelocity: 45 })

  // sustained cannon from both corners for 4s
  const end = Date.now() + 4000
  const frame = () => {
    fire({ particleCount: 6, angle: 60, spread: 55, origin: { x: 0, y: 1 } })
    fire({ particleCount: 6, angle: 120, spread: 55, origin: { x: 1, y: 1 } })
    if (Date.now() < end)
      requestAnimationFrame(frame)
  }
  frame()
})
</script>

<template>
  <div />
</template>
