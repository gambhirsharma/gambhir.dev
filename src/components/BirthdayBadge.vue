<script setup lang="ts">
import { onMounted, ref } from 'vue'

const props = defineProps<{
  birthday: string // 'YYYY-MM-DD'
}>()

const show = ref(false)

onMounted(() => {
  const [, month, day] = props.birthday.split('-').map(Number)
  const now = new Date()
  show.value = now.getMonth() + 1 === month && now.getDate() === day
})
</script>

<template>
  <small v-if="show" style="padding: 3px 6px; border-radius: 4px; background-color: var(--current_time_bg-color); color: var(--current_time_text-color); text-transform: uppercase; margin-left: 0.6rem; vertical-align: middle; font-size: 0.65em;">
    🎈 Birthday 🎈
  </small>
</template>
