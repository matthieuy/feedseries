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
      <div id="pane-shows" class="pane">
        <ul class="list-group">
          <li class="list-group-header">
            <h1 class="text-center">Mes séries</h1>
          </li>
          <li id="li-search" class="list-group-header">
            <input type="search" v-model="filterQuery" v-show="!isLoading" class="form-control" placeholder="Filtrer les séries" autofocus>
          </li>
        </ul>
        <ul id="list-shows" class="list-group">
          <li v-show="isLoading" class="text-center">Chargement en cours...</li>
          <li class="list-group-item show-item-view" v-for="show in shows" v-show="!isLoading">
            <div @contextmenu.prevent="$refs.ShowCtx.$refs.ctx.open($event, show)">
              <div class="pull-left">
                <router-link :to="{name: 'show', params: { id: show._id }}">
                  {{ show.title }}
                </router-link>
                <i class="fa fa-circle" :style="show.status | statusColor"></i>
                <i class="fa fa-archive" v-show="show.isArchived" title="Archivé"></i>
                <i class="fa fa-heart" v-show="show.isFavorited" title="Favoris"></i>
                <div>
                  {{ show.nb_seasons|plurialize('saison', 'saisons') }}, {{ show.nb_episodes|plurialize('épisode', 'épisodes') }}
                </div>
              </div>
              <div class="pull-right text-right">
                {{ show.progress }}% <span v-if="show.progress"> - {{ show.last }}</span>
                <span v-if="show.remaining"><br>{{ show.remaining }} ép. | {{ (show.remaining * show.runtime)|duration }}</span>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <show-ctx ref="ShowCtx">&nbsp;</show-ctx>
  </div>
</template>

<script>
  import { types, localStore } from '../store'
  import ShowCtx from './context/ShowCtx'

  let pane

  export default {
    components: {
      ShowCtx,
    },
    data () {
      return {
        isLoading: true,
        filterQuery: '',
        status: 'current',
        order: localStore.get(localStore.key.SHOWS.ORDER, 'alphabetical'),
        orderReverse: localStore.get(localStore.key.SHOWS.REVERSE, false),
      }
    },
    computed: {
      shows () {
        let shows = this.$store.getters[types.shows.GETTERS.SHOWS](this.status, this.order, this.orderReverse)
        console.log(shows)
        if (!this.filterQuery.length) {
          return shows
        }

        return shows.filter((show) => {
          return show.title.toLowerCase().indexOf(this.filterQuery) > -1
        })
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
    },
    mounted () {
      console.info('[VUE] Mount Shows.vue')
      pane = document.getElementById('pane-shows')
      pane.addEventListener('scroll', scrollListener)
      this.loadList()
    },
    beforeDestroy () {
      pane.removeEventListener('scroll', scrollListener)
    },
  }

  /**
   * Listener on scroll pane (for stickly searchbar)
   * @param {Event} e
   */
  function scrollListener (e) {
    let sticky = document.getElementById('li-search').offsetTop
    if (e.target.scrollTop >= sticky) {
      pane.classList.add('stickly')
    } else {
      pane.classList.remove('stickly')
    }
  }
</script>

<style lang="scss">
  .stickly {
    margin-top: 50px;
    #li-search {
      position: fixed;
      width: 100%;
      top: 35px;
    }
  }
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
