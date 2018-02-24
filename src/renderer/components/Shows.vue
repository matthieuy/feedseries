<template>
  <div class="window">
    <div class="pane-group">
      <div class="pane-sm sidebar shows-sb">
        <nav class="nav-group">
          <h5 class="nav-group-title">Affichage</h5>
          <span class="nav-group-item" :class="{active: status === 'current'}" @click="status = 'current'">
            En cours <i class="fa fa-circle" :style="'current' | statusColor"></i>
          </span>
          <span class="nav-group-item" :class="{active: status === 'active'}" @click="status = 'active'">
            100% <i class="fa fa-circle" :style="'active' | statusColor"></i>
          </span>
          <span class="nav-group-item" :class="{active: status === 'archived'}" @click="status = 'archived'">
            Archivées <i class="fa fa-circle" :style="'archived' | statusColor"></i>
          </span>
          <span class="nav-group-item" :class="{active: status === 'ended'}" @click="status = 'ended'">
            Terminées <i class="fa fa-circle" :style="'Ended' | statusColor"></i>
          </span>
          <span class="nav-group-item" :class="{active: status === ''}" @click="status = ''">
            Toutes <i class="fa fa-circle"></i>
          </span>
        </nav>
        <nav class="nav-group">
          <h5 class="nav-group-title order-title">
            Tri <i class="fa fa-long-arrow-alt-down" :class="{reverse: orderReverse}" @click="orderReverse = !orderReverse"></i>
          </h5>
          <span class="nav-group-item" :class="{active: order === 'alphabetical'}" @click="changeOrder('alphabetical')">Alphabétique</span>
          <span class="nav-group-item" :class="{active: order === 'progression'}"  @click="changeOrder('progression')">Progression</span>
          <span class="nav-group-item" :class="{active: order === 'remaining_time'}"  @click="changeOrder('remaining_time')">Temps restants</span>
          <span class="nav-group-item" :class="{active: order === 'remaining_episodes'}"  @click="changeOrder('remaining_episodes')">Épisodes restants</span>
        </nav>
      </div>
      <div class="pane">
        <ul class="list-group">
          <li class="list-group-header">
            <h1 class="text-center">Mes séries</h1>
          </li>
          <li class="list-group-header">
            <input type="search" v-model="filterQuery" v-show="!isLoading" class="form-control" placeholder="Filtrer les séries" autofocus>
          </li>
          <li v-show="isLoading" class="text-center">Chargement en cours...</li>
          <li class="list-group-item show-item-view" v-for="show in shows" v-show="!isLoading">
            <div @click="toggleShow(show)" @contextmenu.prevent="$refs.ShowCtx.$refs.ctx.open($event, show)">
              <div class="pull-left">
                <router-link :to="{name: 'show', params: { id: show._id }}">
                  {{ show.title }}
                </router-link>
                <i class="fa fa-circle" :style="show.status | statusColor"></i>
                <i class="fa fa-archive" v-show="show.isArchived" title="Archivé"></i>
                <i class="fa fa-heart" v-show="show.isFavorited" title="Favoris"></i>
                <div v-show="show.episodes !== 0">
                  {{ show.nb_seasons|plurialize('saison', 'saisons') }}, {{ show.nb_episodes|plurialize('épisode', 'épisodes') }}
                </div>
              </div>
              <div class="pull-right text-right">
                {{ show.progress }}%
                <span v-if="show.remaining"><br>{{ show.remaining }} ép. | {{ (show.remaining * show.runtime)|duration }}</span>
              </div>
            </div>

            <div class="season-list" v-show="show._id === showIdToDisplay">
              <i class="fa fa-spin fa-spinner" v-show="isLoadingEpisodes"></i>
              <div class="season" v-for="season in seasons" v-show="!isLoadingEpisodes">
                <div @click="toggleSeason(season)" class="cursor"  :class="{open: seasonToDisplay === season.number}">
                  Saison {{ season.number }} <i class="fa fa-circle" :style="season.progress | statusColor"></i>
                </div>

                <table class="table-striped" v-show="seasonToDisplay === season.number">
                  <tbody>
                    <show-tr v-for="episode in season.episodes" :key="episode._id" :show="show" :episode="episode">&nbsp;</show-tr>
                  </tbody>
                </table>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <show-ctx ref="ShowCtx">&nbsp;</show-ctx>
    <episode-ctx ref="EpisodeCtx" :hide-show="true">&nbsp;</episode-ctx>
    <subtitle-ctx ref="SubtitleCtx">&nbsp;</subtitle-ctx>
  </div>
</template>

<script>
  import { types, localStore } from '../store'
  import EpisodeCtx from './context/EpisodeCtx'
  import ShowCtx from './context/ShowCtx'
  import SubtitleCtx from './context/SubtitleCtx'
  import ShowTr from './ShowTr'

  export default {
    components: {
      ShowCtx,
      EpisodeCtx,
      SubtitleCtx,
      ShowTr,
    },
    data () {
      return {
        isLoading: true,
        isLoadingEpisodes: true,
        filterQuery: '',
        status: 'current',
        showIdToDisplay: 0,
        seasonToDisplay: 0,
        order: localStore.get(localStore.key.SHOWS.ORDER, 'alphabetical'),
        orderReverse: localStore.get(localStore.key.SHOWS.REVERSE, false),
      }
    },
    computed: {
      shows () {
        let shows = this.$store.getters[types.shows.GETTERS.SHOWS](this.status, this.order, this.orderReverse)
        if (!this.filterQuery.length) {
          return shows
        }

        return shows.filter((show) => {
          return show.title.toLowerCase().indexOf(this.filterQuery) > -1
        })
      },
      seasons () {
        if (this.showIdToDisplay === 0) {
          return []
        }

        let seasons = this.$store.getters[types.episodes.GETTERS.SEASON_LIST]({_id: this.showIdToDisplay})

        // Set season to display
        let lastSaison = seasons[seasons.length - 1]
        this.seasonToDisplay = (lastSaison && lastSaison.hasOwnProperty('number')) ? lastSaison.number : 0
        for (let i in seasons) {
          if (seasons[i].progress < 100) {
            this.seasonToDisplay = seasons[i].number
            break
          }
        }

        return seasons
      },
    },
    methods: {
      toggleSeason (season) {
        this.seasonToDisplay = (this.seasonToDisplay === season.number) ? 0 : season.number
      },
      toggleShow (show) {
        // None episodes
        if (show.nb_episodes === 0) {
          return false
        }

        // Hide
        if (show._id === this.showIdToDisplay) {
          this.showIdToDisplay = 0
          return false
        }

        this.isLoadingEpisodes = true
        this.showIdToDisplay = show._id
        this.seasonToDisplay = 0
      },
      changeOrder (order) {
        if (this.order === order) {
          this.orderReverse = !this.orderReverse
        } else {
          this.order = order
          this.orderReverse = false
        }
      },
      loadList () {
        this.isLoading = true
        this.$store.dispatch(types.shows.ACTIONS.LOAD_LIST).then((episodes) => {
          if (episodes.length) {
            this.isLoading = false
          }
        })
      },
    },
    watch: {
      order (order) {
        localStore.set(localStore.key.SHOWS.ORDER, order)
      },
      orderReverse (reverse) {
        localStore.set(localStore.key.SHOWS.REVERSE, reverse)
      },
      showIdToDisplay (showId) {
        if (showId !== 0) {
          this.$store.dispatch(types.episodes.ACTIONS.LOAD_EPISODES, {_id: showId})
        }
      },
      seasons (seasons) {
        this.isLoadingEpisodes = (seasons.length === 0)
      },
    },
    mounted () {
      console.info('[VUE] Mount Shows.vue')
      this.loadList()
    },
  }
</script>

<style lang="scss">
  .fa-circle {
    font-size: 8px;
  }
  .shows-sb {
    .fa-circle {
      /*font-size: 8px;*/
      line-height: 14px;
    }
    .order-title .fa {
      transform: rotate(0deg);
      transition: transform 0.5s;
    }
    .order-title .fa.reverse {
      transform: rotate(180deg);
    }
  }
  .show-item-view {
    .fa {
      margin-left: 3px;
    }

    .date.future {
      color: #b4171f;
      i:before {
        font-size: 8px;
        content: '\f071';
        padding-right: 3px;
      }
    }
    .icon-mark-view {
      .fa {
        font-size: 12px;
        margin-right: 10px;
        vertical-align: middle;
      }
    }
  }
</style>
