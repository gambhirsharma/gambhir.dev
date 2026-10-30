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
      time: this.getTime(),
      intervalId: null,
    }
  },
  mounted() {
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
