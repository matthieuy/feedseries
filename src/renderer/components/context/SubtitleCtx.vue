<template>
  <context-menu ref="ctx" @ctx-open="onOpen" @ctx-close="onCtxClose" @ctx-cancel="onCtxClose">
    <li class="ctx-header">{{ subtitles.length|plurialize('sous-titre', 'sous-titres') }}</li>
    <li class="ctx-divider" v-show="subtitles.length"></li>
    <li class="ctx-item" v-for="subtitle in subtitles" @click="downloadSubtitle(subtitle)">
      <img :src="'static/flags/' + subtitle.language + '.png'" /> {{ subtitle.name }}
    </li>
  </context-menu>
</template>

<script>
  import api from '../../api'
  import { types } from '../../store'

  export default {
    data () {
      return {
        episode: null,
      }
    },
    computed: {
      subtitles () {
        return (!this.episode) ? [] : this.$store.getters[types.subtitles.GETTERS.SUBTITLES](this.episode)
      },
    },
    methods: {
      /**
       * Download the subtitle file
       * @param {Subtitle} subtitle
       */
      downloadSubtitle (subtitle) {
        this.$store.dispatch(types.subtitles.ACTIONS.DL_SUBTITLE, subtitle)
      },
      /**
       * on open context menu
       * @param {Episode} episode
       */
      onOpen (episode) {
        this.episode = episode
        console.info('[CONTEXT]', this.subtitles)

        // Load shows subtitles
        api.subtitles.getShow(episode.show).then((subtitles) => {
          if (!subtitles.length) {
            this.$refs.ctx.ctxVisible = false
            this.onCtxClose()
          }
        })

        // Close other context-menu
        let parentRef = this.$parent.$refs
        let thisTag = this.$options._componentTag
        for (let i in parentRef) {
          if (thisTag !== this.$parent.$refs[i].$options._componentTag && this.$parent.$refs[i].$refs.ctx) {
            this.$parent.$refs[i].$refs.ctx.ctxVisible = false
          }
        }
        window.addEventListener('keydown', this.escapeListener)
      },
      /**
       * On close ctx : remove listener
       */
      onCtxClose () {
        window.removeEventListener('keydown', this.escapeListener)
      },
      /**
       * When press Escape key
       * @param event
       */
      escapeListener (event) {
        if (event.which === 27) {
          console.log(this.$refs)
          this.$refs.ctx.ctxVisible = false
          this.onCtxClose()
        }
      },
    },
  }
</script>
