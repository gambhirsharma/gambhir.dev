<script>
export default {
  name: 'RomeTime',
  data() {
    return {
      romeTime: this.getRomeTime(),
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
    getRomeTime() {
      return new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Rome',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }).format(new Date())
    },
    updateTime() {
      this.romeTime = this.getRomeTime()
    },
  },
}
</script>

<template>
  <div>{{ romeTime }}</div>
</template>

<style scoped>
html.dark {
  --bg-color: #161b22;
  --text-color: #42b983;
}

html:not(.dark) {
  --bg-color: #ffffff;
  --text-color: #161b22;
}

div {
  padding: 9px 4px;
  border-radius: 4px;
  background-color: var(--current_time_bg-color);
  color: var(--current_time_text-color);
  /*background-color: #161b22;*/
  /*  color: #42b983;*/
  margin: 0;
  text-transform: uppercase;
}
</style>
