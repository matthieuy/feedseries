<template>
  <div id="about">
    <div class="header">
      <img src="static/icons/icon.png">
      <div>FeedSeries v{{ version }}</div>
    </div>
    {{ info }}
  </div>
</template>

<script>
  import { remote } from 'electron'

  export default {
    data () {
      return {
        version: remote.app.getVersion(),
      }
    },
  }
</script>

<style lang="scss">
  #about {
    color: #fff;
    padding: 10px;
    .header {
      text-align: center;
      font-size: 1.5em;
    }
  }
</style>
