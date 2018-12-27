<template>
  <div v-show="show">
    <div>
      <div class="binfo description" v-show="show.description">
        {{ show.description }}
      </div>
      <div class="binfo">
        <span class="fa fa-star"></span>
        {{ show.note }}
      </div>
      <div class="binfo" v-show="show.friends">
        Suivi par :
        <div v-for="friend in show.friends" class="friends-list">
          <img class="avatars" :src="avatarURL(friend.id)" onerror="this.src='static/empty.png'" width="20" height="20">
          {{ friend.login }}
        </div>
      </div>
      <div class="binfo">
        <i class="fa fa-users"></i>
        {{ show.followers|plurialize('membre', 'membres') }}
      </div>
      <div class="binfo">
        <i class="far fa-clock"></i>
        {{ show.nb_seasons|plurialize('saison', 'saisons') }} - {{ show.nb_episodes|plurialize('épisode', 'épisodes') }} de {{ show.runtime|duration}}
      </div>
      <div class="binfo" v-show="show.genres.length">
        <i class="fa fa-tag"></i>
        {{ show.genres|join(', ') }}
      </div>
      <div class="binfo" v-show="show.network">
        <i class="fa fa-tv"></i>
        {{ show.network }}
      </div>
      <div class="binfo">
        <i class="fa fa-circle" :style="show.status | statusColor"></i>
        <span v-if="show.status === 'Continuing'">
          En cours
        </span>
        <span v-else-if="show.status === 'Ended'">
          Terminée
        </span>
      </div>
      <div class="binfo" v-show="show.in_account">
        Progression : {{ show.progress }}%
        <span v-show="show.remaining"><br>Ép. restants : {{ show.remaining }}</span>
        <span v-show="show.isArchived"><br><i class="fa fa-archive"></i> Archivé</span>
        <span v-show="show.isFavorited"><br><i class="fa fa-heart"></i> Favorite</span>
      </div>
    </div>
    <div class="clearfix"></div>

    <div class="season-list">
      <div v-for="season in seasons">
        <h3>
          Saison {{ season.number }}
          <i class="fa fa-circle" :style="season.progress | statusColor"></i>
          <div class="pull-right season-action" v-show="show.in_account">
            <i v-show="season.progress !== 100" class="fa fa-download cursor" v-tooltip="'Marquer la saison récupérée'" @click="markSeasonDL(season.number, true)"></i>
            <span v-show="season.progress !== 100" class="fa-stack cursor" v-tooltip="'Marquer la saison non-récupérée'" @click="markSeasonDL(season.number, false)">
              <i class="fa fa-download fa-stack-1x"></i>
              <i class="fa fa-ban fa-stack-2x"></i>
            </span>
            <i v-show="season.progress !== 100" class="fa fa-eye cursor" v-tooltip="'Marquer la saison comme vu'" @click="markSeasonView(season.number, true)"></i>
            <i v-show="season.progress !== 0" class="fa fa-eye-slash cursor" v-tooltip="'Marquer la saison comme non-vu'" @click="markSeasonView(season.number, false)"></i>
          </div>
        </h3>

        <div class="season">
          <table class="table-striped">
            <tbody>
            <show-tr v-for="episode in season.episodes" :key="episode._id" :show="show" :episode="episode">&nbsp;</show-tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <episode-ctx ref="EpisodeCtx" :hide-show="true">&nbsp;</episode-ctx>
    <subtitle-ctx ref="SubtitleCtx">&nbsp;</subtitle-ctx>
  </div>
</template>

<script>
  import { mapState, mapGetters } from 'vuex'

  import api from '../../api'
  import { Stat } from '../../db'
  import { types } from '../../store'
  import ShowTr from '../ShowTr'
  import EpisodeCtx from '../context/EpisodeCtx'
  import SubtitleCtx from '../context/SubtitleCtx'

  export default {
    components: {
      EpisodeCtx,
      SubtitleCtx,
      ShowTr,
    },
    data () {
      return {
        isLoading: true,
      }
    },
    computed: {
      ...mapState({
        show: state => state.show.show,
      }),
      ...mapGetters({
        seasonsGetter: types.episodes.GETTERS.SEASON_LIST,
      }),
      seasons () {
        return this.seasonsGetter(this.show).reverse()
      },
    },
    methods: {
      /**
       * Mark all episode of a season as DL
       * @param {Integer} seasonNumber
       * @param {Boolean} isDL
       */
      markSeasonDL (seasonNumber, isDL) {
        let episodes = this.seasons.find((a) => { return a.number === seasonNumber }).episodes
        episodes = episodes.filter((a) => { return !a.isSeen && a.isDownloaded !== isDL })
        if (episodes.length) {
          let promises = []
          episodes.forEach((episode) => {
            let p = this.$store.dispatch(types.episodes.ACTIONS.MARK_DL, {
              episode: episode,
              isDL: isDL,
              nbEpisode: 0,
            })
            promises.push(p)
          })
          Promise.all(promises).then(() => {
            Stat.incrementValue('d', isDL, episodes.length)
          })
        }
      },
      /**
       * Mark season as view
       * @param {Integer} seasonNumber
       * @param {Boolean} isView
       */
      markSeasonView (seasonNumber, isView) {
        let episodes = this.seasons.find((a) => { return a.number === seasonNumber }).episodes
        episodes = episodes.filter((a) => { return a.isSeen !== isView })
        if (episodes.length) {
          let promises = []
          episodes.forEach((episode) => {
            promises.push(this.$store.dispatch(types.episodes.ACTIONS.MARK_VIEW, {
              episode: episode,
              isView: isView,
              nbEpisode: 0,
            }))
          })
          Promise.all(promises).then(() => {
            Stat.incrementValue('v', isView, episodes.length)
            Stat.incrementValue('t', isView, this.show.runtime * episodes.length)
          })
        }
      },
      /**
       * Load episodes
       */
      loadEpisodes () {
        this.isLoading = true
        this.$store.commit(types.episodes.MUTATIONS.SET_EPISODES, [])
        this.$store.dispatch(types.episodes.ACTIONS.LOAD_EPISODES, this.show).then((episodes) => {
          this.isLoading = false
        })
      },
      /**
       * Get avatar URL
       * @param {Integer} userId
       * @return {string}
       */
      avatarURL (userId) {
        return api.members.getAvatarURL(userId, 20)
      },
    },
    watch: {
      show () {
        this.loadEpisodes()
      },
    },
    mounted () {
      console.info('[VUE] Mount show:summary.vue')
      this.loadEpisodes()
    },
  }
</script>

<style lang="scss">
  .season-list {
    margin-bottom: 25px;
    h3 {
      font-size: 1.5em;
      margin-top: 5px;
    }
    .fa-circle {
      font-size: 8px;
    }
  }
  .binfo.description {
    float: initial;
    margin-bottom: 5px;
  }
  .binfo .friends-content {
    display: block;
  }
  .friends-list {
    padding-top: 3px;
  }
  .season-action {
    font-size: 12px;
    margin-top: 12px;
    margin-right: 5px;
    .fa {
      margin-left: 3px;
    }
    .fa-stack {
      font-size: 9px;
    }
    .fa-stack-1x {
      font-size: 12px;
    }
    .fa-stack-2x {
      opacity: 0.7;
    }
  }
</style>
