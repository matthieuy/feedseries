<template>
  <div v-show="show">
    <div>
      <div class="binfo description" v-show="show.description">{{ show.description }}</div>
      <div class="binfo">
        <span class="fa fa-star"></span>
        {{ show.note }}
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
        <h3>Saison {{ season.number }} <i class="fa fa-circle" :style="season.progress | statusColor"></i></h3>

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
      loadEpisodes () {
        this.isLoading = true
        this.$store.commit(types.episodes.MUTATIONS.SET_EPISODES, [])
        this.$store.dispatch(types.episodes.ACTIONS.LOAD_EPISODES, this.show).then((episodes) => {
          this.isLoading = false
        })
      },
    },
    watch: {
      show (show) {
        console.log('Update', show)
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
</style>
