<template>
  <div>
    About
    {{ platform }}
  </div>
</template>

<script>
  export default {
    data () {
      return {
        platform: require('os').platform(),
      }
    },
  }
</script>
