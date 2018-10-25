<template>
  <div>
    <div class="pane-group">
      <div class="pane-sm sidebar">
        <nav class="nav-group">
          <h5 class="nav-group-title">Filtre</h5>
          <a class="nav-group-item" :class="{active: filter === 'view'}" @click="filter = 'view'">
            <i class="fa fa-eye"></i> À voir <span v-show="nbEpisodeDl">({{ nbEpisodeDl }})</span>
          </a>
          <a class="nav-group-item" :class="{active: filter === 'get'}" @click="filter = 'get'">
            <i class="fa fa-download"></i> À récupérer <span v-show="nbEpisodeDl">({{ nbEpisodeNotDl }})</span>
          </a>
          <a class="nav-group-item" :class="{active: filter === 'all'}" @click="filter = 'all'">
            <i class="fa fa-list"></i> Tous ({{ nbEpisodeDl + nbEpisodeNotDl }})
          </a>
        </nav>

        <nav class="nav-group">
          <h5 class="nav-group-title">Nombres</h5>
          <span class="nav-group-item">
            <div class="btn-group">
              <span class="btn btn-nav" :class="{active: limit === 1}" @click="limit = 1">1</span>
              <span class="btn btn-nav" :class="{active: limit === 3}" @click="limit = 3">3</span>
              <span class="btn btn-nav" :class="{active: limit === 5}" @click="limit = 5">5</span>
              <span class="btn btn-nav" :class="{active: limit === 0}" @click="limit = 0">Tous</span>
            </div>
          </span>
        </nav>

        <nav class="nav-group">
          <h5 class="nav-group-title">Ordre</h5>
          <a class="nav-group-item" :class="{active: order === 'alpha'}" @click="changeOrder('alpha')">
            <i class="fa" :class="[orderReverse && order === 'alpha' ? 'fa-sort-alpha-up' : 'fa-sort-alpha-down']"></i> Alphabétique
          </a>

          <a class="nav-group-item" :class="{active: order === 'date'}" @click="changeOrder('date')">
            <i class="fa" :class="[orderReverse && order === 'date' ? 'fa-sort-amount-up' : 'fa-sort-amount-down']"></i> Date
          </a>
        </nav>
      </div>
      <div class="pane">
        <ul class="list-group list-episodes">
          <li class="list-group-header">
            <h1 class="text-center">Mes épisodes</h1>
          </li>
          <li v-show="isLoading" class="text-center ellipse-loading">Chargement en cours</li>
          <li v-show="!isLoading" v-for="episode in episodes" class="list-group-item" @contextmenu.prevent="$refs.EpisodeCtx.$refs.ctx.open($event, episode)">
            <div class="pull-left media-body date">
              <span v-show="episode.date" v-tooltip="$options.filters.formatDate(episode.date , 'ddd DD MMM YYYY')">{{ episode.date | formatDate('ddd DD MMM') }}</span>
              <span v-show="!episode.date">Pas de date</span>
            </div>
            <div class="pull-left media-body">
              <span v-show="episode.special" style="color: #1a82fb">[Spécial]</span>
              <strong>
                <router-link :to="{name: 'show', params: { id: episode.show._id }}">{{ episode.show.title }}</router-link>
              </strong> {{ episode.code }}
              <i class="fa fa-heart" v-show="episode.show.isFavorited" v-tooltip="'Favoris'"></i>
              <i class="fa fa-circle" :style="episode.show.status | statusColor" v-show="episode.show.status == 'Ended'"></i>
              <i class="fa fa-download" v-show="filter === 'all' && episode.isDownloaded" v-tooltip="'Épisode récupéré'"></i>
              <i
                  class="fa fa-file-alt cursor"
                  v-tooltip="$options.filters.plurialize(getSubtitles(episode).length, 'sous-titre', 'sous-titres')"
                  @click="$refs.SubtitleCtx.$refs.ctx.open($event, episode)"></i>
              <friend-bubble :friends="episode.friends"></friend-bubble>
              <p>{{ episode.title }}</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <episode-ctx ref="EpisodeCtx">&nbsp;</episode-ctx>
    <subtitle-ctx ref="SubtitleCtx">&nbsp;</subtitle-ctx>
  </div>
</template>

<script>
  import api from '../api'
  import { types, localStore } from '../store'
  import EpisodeCtx from './context/EpisodeCtx'
  import SubtitleCtx from './context/SubtitleCtx'
  import FriendBubble from './FriendBubble'

  export default {
    components: {
      EpisodeCtx,
      SubtitleCtx,
      FriendBubble,
    },
    data () {
      return {
        isLoading: true,
        filter: localStore.get(localStore.key.EPISODES.FILTER, 'all'),
        limit: localStore.get(localStore.key.EPISODES.LIMIT, 1),
        order: localStore.get(localStore.key.EPISODES.ORDER, 'date'),
        orderReverse: localStore.get(localStore.key.EPISODES.REVERSE, false),
      }
    },
    computed: {
      episodes () {
        return this.$store.getters[types.episodes.GETTERS.EPISODES_UNSEEN](this.filter, this.limit, this.order, this.orderReverse)
      },
      nbEpisodeDl () {
        return this.$store.getters[types.episodes.GETTERS.NB_DL](true)
      },
      nbEpisodeNotDl () {
        return this.$store.getters[types.episodes.GETTERS.NB_DL](false)
      },
    },
    methods: {
      changeOrder (order) {
        if (this.order === order) {
          this.orderReverse = !this.orderReverse
        } else {
          this.order = order
          this.orderReverse = false
        }
      },
      getSubtitles (episode) {
        return this.$store.getters[types.subtitles.GETTERS.SUBTITLES](episode)
      },
      avatarURL (userId) {
        return api.members.getAvatarURL(userId, 20)
      },
    },
    watch: {
      filter (filter) {
        localStore.set(localStore.key.EPISODES.FILTER, filter)
      },
      limit (limit) {
        localStore.set(localStore.key.EPISODES.LIMIT, limit)
      },
      order (order) {
        localStore.set(localStore.key.EPISODES.ORDER, order)
      },
      orderReverse (reverse) {
        localStore.set(localStore.key.EPISODES.REVERSE, reverse)
      },
    },
    mounted () {
      console.info('[VUE] Mount Episodes.vue')
      this.$store.dispatch(types.episodes.ACTIONS.LOAD_UNSEEN).then((episodes) => {
        this.$store.dispatch(types.subtitles.ACTIONS.LOAD_SUBTITLES).then(() => {
          this.isLoading = false
        })
      })
    },
  }
</script>

<style lang="scss">
  @import "../assets/scss/vars";

  .list-episodes {
    .date {
      line-height: 35px;
      margin-right: 10px;
      min-width: 75px;
    }
    .list-group-item {
      padding: 6px;
    }
    .fa-circle {
      vertical-align: text-top;
      line-height: 1em;
    }
  }
</style>
