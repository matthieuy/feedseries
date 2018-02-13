<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    mounted () {
      // Disable drag
      window.ondragstart = () => { return false }
    },
  }
</script>

<style lang="scss">
  body {
    -webkit-user-drag: text;
    -webkit-user-select: none;
    -webkit-box-sizing: border-box;
    cursor: default;
  }
</style>
