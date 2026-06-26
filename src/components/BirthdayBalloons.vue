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

onMounted(() => {
  if (!isBirthday(props.birthday))
    return

  const balloon = confetti.shapeFromText({ text: '🎈', scalar: 2 })
  const end = Date.now() + 6000

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 1 },
      shapes: [balloon],
      scalar: 2,
      gravity: -0.6,
      drift: 0.5,
    })
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 1 },
      shapes: [balloon],
      scalar: 2,
      gravity: -0.6,
      drift: -0.5,
    })

    if (Date.now() < end)
      requestAnimationFrame(frame)
  }

  frame()
})
</script>

<template>
  <div />
</template>
