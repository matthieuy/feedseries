<template>
  <context-menu ref="ctx" @ctx-open="onOpen" @ctx-close="onCtxClose" @ctx-cancel="onCtxClose">
    <li class="ctx-header">Recommandation</li>
    <li class="ctx-item" v-if="recommendation.to_id === userId" @click="changeStatus('accept')">
      <i class="fa fa-thumbs-up"></i> Accepter
    </li>
    <li class="ctx-item" v-if="recommendation.to_id === userId" @click="changeStatus('decline')">
      <i class="fa fa-thumbs-down"></i> Refuser
    </li>
    <li class="ctx-item" @click="deleteOne()">
      <i class="fa fa-times-circle"></i> Supprimer
    </li>
  </context-menu>
</template>

<script>
  import api from '../../api'
  import { types, localStore } from '../../store'

  export default {
    data () {
      return {
        recommendation: {
          to_id: null,
        },
        userId: false,
      }
    },
    methods: {
      /**
       * Accept/Decline a recommendation
       */
      changeStatus (status) {
        api.recommendations.changeStatus(this.recommendation.id, status).then((recommendation) => {
          this.$store.commit(types.recommendations.MUTATIONS.SET_RECOMMENDATION, recommendation)
        })
      },
      /**
       * Delete a recommendation
       */
      deleteOne () {
        api.recommendations.delete(this.recommendation.id).then(() => {
          this.$store.dispatch(types.recommendations.ACTIONS.LOAD_RECOMMENDATIONS)
        })
      },
      /**
       * On open context menu
       * @param {Object} recommendation
       */
      onOpen (recommendation) {
        console.log('[CONTEXT]', recommendation)
        this.recommendation = recommendation
        this.userId = localStore.get(localStore.key.ID_USER, false)

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
          this.$refs.ctx.ctxVisible = false
          this.onCtxClose()
        }
      },
    },
  }
</script>
