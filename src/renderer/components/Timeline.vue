<template>
  <div class="window timeline">
    <div v-show="isLoading" class="text-center">Chargement en cours...</div>
    <div class="window-content">
      <ul>
        <li v-for="event in timeline.events" class="event">
          <img :class="'event-avatar-' + event.id" :src="userAvatar(event)" alt="" width="24" height="24" />
          <i class="type-icon fa" :class="iconType(event.type)"></i>
          <span :title="event.date | formatDate('ddd DD à HH[h]mm')">{{ event.date | fromNow }}</span>,
          {{ event.user }} <span v-html="event.html" :class="{link: isLinkEnabled(event)}" @click="clickLink(event, $event)"></span>
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
        isLinkEnabled (event) {
          let types = ['archive', 'unarchive', 'add_serie', 'del_serie']
          return types.indexOf(event.type) !== -1 && event.ref
        },
        clickLink (event, e) {
          e.preventDefault()
          if (this.isLinkEnabled(event)) {
            this.$router.push({name: 'show', params: { id: event.ref }})
          }
        },
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
        userAvatar (event) {
          let url = api.members.getAvatarURL(event.userId, 24)
          return url
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
            case 'recommandation':
            case 'recommandation_accept':
              return 'fa-thumbs-up'
            case 'recommandation_decline':
              return 'fa-thumbs-down'
            case 'del_serie':
              return 'fa-trash'
            case 'badge':
              return 'fa-trophy'
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
      .link a {
        text-decoration: underline;
        cursor: pointer;
      }
    }
    .toolbar-footer {
        .title { cursor: pointer; }
        .title.disabled { cursor: not-allowed; }
    }
    .fa-star, .fa-thumbs-up { color: #b4af12; }
    .fa-plus-circle { color: #195625; }
    .fa-trash { color: #fb1710; }
    .fa-trophy { color: #ecf000; }
  }
</style>
