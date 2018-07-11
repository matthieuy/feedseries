<template>
  <div id="about">
    <div class="drag"></div>
    <div class="close" @click="close()">&times;</div>
    <div class="header">
      <img src="static/icons/icon-b.png" width="128" height="128">
      <div>FeedSeries v{{ version }}</div>
    </div>
    <div class="credits">
      <!-- Please don't remove the credits -->
      Développement :
      <ul>
        <li>Matthieu YK</li>
      </ul>
      Remerciements :
      <ul>
        <li @click="openLink('https://www.betaseries.com')" class="cursor">BetaSeries</li>
        <li @click="openLink('https://electronjs.org')" class="cursor">Electron</li>
        <li @click="openLink('http://game-icons.net/')" class="cursor">Game Icons</li>
        <li @click="openLink('https://vuejs.org/')" class="cursor">VueJS</li>
      </ul>
    </div>
    <div class="github" @click="openLink('https://github.com/matthieuy/feedseries')">
      Github <img src="static/github.png" width="24">
    </div>
  </div>
</template>

<script>
  import { shell, remote } from 'electron'

  export default {
    data () {
      return {
        version: remote.app.getVersion(),
      }
    },
    methods: {
      openLink (url) {
        shell.openExternal(url)
      },
      /**
       * Close the about modal
       */
      close () {
        remote.getCurrentWindow().close()
      },
    },
    mounted () {
      console.log('[VUE] Mount About.vue')
    },
  }
</script>

<style lang="scss">
  @import "../../assets/scss/vars";
  @import "../../assets/scss/scrollbar";

  #about {
    color: $navColor;
    .header {
      text-align: center;
      font-size: 1.5em;
      img {
        -webkit-app-region: drag;
      }
    }
    .credits {
      border-radius: 5px;
      margin: 5px;
      background-color: darken($backgroundColor, 10%);
      padding: 10px;
      max-height: 100px;
      overflow: auto;
      ul {
        margin: 3px 0 25px 0;
        list-style: none;
        padding: 0 0 0 10px;
        &:last-child {
          margin-bottom: 0;
        }
      }
      li {
        display: block;
      }
    }
    .github {
      position: absolute;
      bottom: 3px;
      right: 5px;
      font-size: 15px;
      cursor: pointer;
      img {
        vertical-align: middle;
        margin-top: -1px;
      }
    }
    .close {
      position: absolute;
      z-index: 5;
      top: 0;
      right: 0;
      padding: 0 3px;
      font-size: 1.5em;
      cursor: pointer;
    }
    .drag {
      position: absolute;
      top: 0;
      left: 0;
      height: 15px;
      width: calc(100% - 20px);
      -webkit-app-region: drag;
    }
  }

  .cursor {
    cursor: pointer;
  }
</style>
