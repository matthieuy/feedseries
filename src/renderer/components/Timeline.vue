<template>
  <div class="window timeline">
    <div v-show="isLoading" class="text-center">Chargement en cours...</div>
    <div class="window-content">
      <ul>
        <li v-for="event in timeline.events" class="event">
          <img :src="userAvatar(event.userId)" alt="" width="24" height="24" />
          <i class="type-icon fa" :class="iconType(event.type)"></i>
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

    import api from '../api'
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
        userAvatar (userId) {
          return api.members.getAvatarURL(userId, 24)
        },
        iconType (type) {
          switch (type) {
            case 'markas':
              return 'fa-eye'
            case 'archive':
            case 'unarchive':
              return 'fa-archive'
            case 'add_serie':
              return 'fa-plus-circle'
          }
        },
      },
      mounted () {
        console.info('[VUE] Mount Timeline.vue')
        this.getList()
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
    li.event {
      list-style: none;
      line-height: 24px;
      margin-bottom: 5px;
      padding: 0 15px;
      width: 100%;
      &:hover {
        background-color: $navActiveBg;
      }
      img {
        border-radius: 12px;
        vertical-align: middle;
        margin-right: 5px;
        width: 24px;
        height: 24px;
      }
      .type-icon {
        margin-right: 3px;
      }
      a {
        color: inherit;
        font-weight: bold;
        text-decoration: none;
        cursor: default;
      }
    }
    .toolbar-footer {
        .title { cursor: pointer; }
        .title.disabled { cursor: not-allowed; }
    }
    .fa-star { color: #b4af12; }
  }
</style>
