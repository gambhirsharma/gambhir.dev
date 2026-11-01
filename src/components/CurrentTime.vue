<script>
export default {
  name: 'CurrentTime',
  props: {
    timeZone: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      // Stable placeholder so the server-rendered HTML matches the first client
      // render (avoids a Vue hydration mismatch). The real time is set in mounted().
      time: '--:--:--',
      intervalId: null,
    }
  },
  mounted() {
    this.updateTime()
    this.intervalId = setInterval(this.updateTime, 1000)
  },
  beforeUnmount() {
    clearInterval(this.intervalId)
  },
  methods: {
    getTime() {
      return new Date().toLocaleTimeString('en-US', { timeZone: this.timeZone })
    },
    updateTime() {
      this.time = this.getTime()
    },
  },
}
</script>

<template>
  <span>{{ time }}</span>
</template>
