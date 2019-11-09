<template>
  <div class="timeline">
    <div v-show="isLoading" class="text-center ellipse-loading">Chargement en cours</div>
    <div class="window-content">
      <ul>
        <timeline-event :event="event" v-for="event in timeline.events" :key="timeline.id" :link-enable="linkEnable" :display-avatar="displayAvatar"></timeline-event>
      </ul>
    </div>
    <footer class="toolbar toolbar-footer" @click="loadMore()" v-show="!isLoading && !show">
        <h1 class="title" :class="{disabled: disableMore}">
            <span class="fa" :class="[disableMore ? 'fa-spinner fa-spin' : 'fa-plus-circle']"></span> Plus d'activités
        </h1>
    </footer>
  </div>
</template>

<script>
    import { mapState } from 'vuex'

    import { types } from '../store'
    import TimelineEvent from './TimelineEvent'

    export default {
      components: {
        TimelineEvent,
      },
      props: {
        show: { type: Object, required: false },
        linkEnable: { default: true },
        displayAvatar: { default: true },
      },
      data () {
        return {
          isLoading: true,
          disableMore: true,
        }
      },
      computed: {
        ...mapState([
          'timeline',
        ]),
      },
      methods: {
        getList () {
          this.isLoading = true
          this.$store.dispatch(types.timeline.ACTIONS.LOAD, this.getShowId()).then(() => {
            this.isLoading = false
            this.disableMore = false
          })
        },
        loadMore () {
          if (this.disableMore || !this.timeline.events.length) {
            return false
          }
          this.disableMore = true
          this.$store.dispatch(types.timeline.ACTIONS.LOAD_MORE, this.getShowId()).then(() => {
            this.disableMore = false
          })
        },
        getShowId () {
          return (this.show) ? this.show._id : ''
        },
      },
      mounted () {
        console.info('[VUE] Mount Timeline.vue')
        this.getList()
      },
      destroyed () {
        this.$store.commit(types.timeline.MUTATIONS.SET_EVENTS, [])
      },
    }
</script>

<style lang="scss">
  @import "../assets/scss/vars";
  .timeline {
    ul {
      width: 100%;
      padding: 0;
    }
    .toolbar-footer {
        .title { cursor: pointer; }
        .title.disabled { cursor: not-allowed; }
    }
  }
</style>
