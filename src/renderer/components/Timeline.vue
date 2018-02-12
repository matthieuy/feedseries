<template>
  <div class="window timeline">
    <div v-show="isLoading" class="text-center">Chargement en cours...</div>
    <div class="window-content">
      <ul>
        <li v-for="event in timeline.events" class="event">
            <span :title="event.date | formatDate('ddd DD à HH[h]mm')">{{ event.date | fromNow }}</span>,
            {{ event.user }} <span v-html="event.html" v-on:click.prevent=""></span>
            <span class="fa fa-star" v-show="event.note" v-for="star in event.note"></span>
        </li>
      </ul>
    </div>
    <footer class="toolbar toolbar-footer" @click="loadMore()" v-show="!isLoading">
        <h1 class="title" :class="{disabled: disableMore}">
            <span class="fa" :class="[disableMore ? 'fa-spinner fa-spin' : 'fa-plus-circle']"></span> Plus d'activités
        </h1>
    </footer>
  </div>
</template>

<script>
    import { mapState } from 'vuex'

    import { types } from '../store'

    export default {
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
          this.$store.dispatch(types.timeline.ACTIONS.LOAD).then(() => {
            this.isLoading = false
            this.disableMore = false
          })
        },
        loadMore () {
          if (this.disableMore || !this.timeline.events.length) {
            return false
          }
          this.disableMore = true
          this.$store.dispatch(types.timeline.ACTIONS.LOAD_MORE).then(() => {
            this.disableMore = false
          })
        },
      },
      mounted () {
        console.info('[VUE] Mount Timeline.vue')
        this.getList()
      },
    }
</script>

<style lang="scss">
  .timeline {
    li.event a {
      color: inherit;
      font-weight: bold;
    }
    .toolbar-footer {
        .title { cursor: pointer; }
        .title.disabled { cursor: not-allowed; }
    }
    .fa-star { color: #b4af12; }
  }
</style>
