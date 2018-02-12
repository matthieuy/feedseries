<template>
  <context-menu ref="ctx" @ctx-open="onOpen">
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
          }
        })

        // Close other context-menu
        let parentRef = this.$parent.$refs
        let thisTag = this.$options._componentTag
        for (let i in parentRef) {
          if (thisTag !== this.$parent.$refs[i].$options._componentTag) {
            this.$parent.$refs[i].$refs.ctx.ctxVisible = false
          }
        }
      },
    },
  }
</script>
