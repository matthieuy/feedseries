<template>
  <context-menu ref="ctx" @ctx-open="onOpen">
    <li class="ctx-header text-center">
      {{ character.name }}<br>
      ({{ character.actor }})
    </li>
    <li class="ctx-divider"></li>
    <li class="ctx-item" @click="qwant()"><img src="static/links/qwant.png"> Rechercher sur Qwant</li>
  </context-menu>
</template>

<script>
  import { types } from '../../store'

  export default {
    data () {
      return {
        character: false,
      }
    },
    methods: {
      qwant () {
        let url = `https://www.qwant.com/?q=${this.character.actor}`
        this.$store.dispatch(types.ACTIONS.OPEN_LINK, url)
      },
      /**
       * On open context menu
       * @param {Object} character
       */
      onOpen (character) {
        console.info('[CONTEXT]', character)
        this.character = character

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
