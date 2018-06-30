<template>
    <div class="profil">
      <div v-show="stats.id">
        <div class="fleft">
          <img :src="stats.avatar" alt="" class="avatar">
        </div>
        <div class="fleft cols">
          <div class="fleft col20">
            <div class="binfo" v-if="stats.friends"><i class="fa fa-users"></i> {{ stats.friends|plurialize('ami', 'amis') }}</div>
            <div class="binfo"><i class="fa fa-certificate"></i> {{ stats.xp }} XP</div>
            <div class="binfo" v-if="stats.comments"><i class="fa fa-comments"></i> {{ stats.comments|plurialize('commentaire', 'commentaires') }}</div>
            <div class="binfo" v-if="stats.badges"><i class="fa fa-trophy"></i> {{ stats.badges|plurialize('badge', 'badges') }}</div>
            <div class="binfo" v-if="stats.written_words"><i class="fa fa-pencil-alt"></i> {{ stats.written_words|plurialize('mot écrit', 'mots écrits') }}</div>
            <div class="clearfix"></div>
          </div>
          <div class="fleft col60">
            <div class="binfo">
              <div id="showChart"></div>
              <div class="clearfix"></div>
            </div>
          </div>
          <div class="fleft col20">
            <div class="binfo"><i class="fa fa-chart-line"></i> {{ stats.episodes_per_month|plurialize('épisode', 'épisodes') }} / mois</div>
            <div class="binfo"><i class="fa fa-calendar-check"></i> {{ stats.streak_days|plurialize('jour consécutif', 'jours consécutifs') }}</div>
            <div class="binfo"><i class="fa fa-birthday-cake"></i> Inscrit depuis {{ stats.member_since_days|plurialize('jour', 'jours') }}</div>
            <div class="binfo"><i class="fa fa-star"></i> "{{ stats.favorite_genre }}" à mater le {{ stats.favorite_day }}</div>
          </div>
        </div>
        <div class="clearfix"></div>
        <div class="linear-stats">
          <div class="fleft binfo">
            <i class="fa fa-clock"></i> {{ stats.time_on_tv|duration_tv }}
            <span v-if="stats.episodes">({{ stats.episodes|plurialize('épisode vu', 'épisodes vus') }})</span>
          </div>
          <div class="fleft binfo" v-if="stats.time_to_spend">
            <i class="fa fa-hourglass"></i>
            Encore {{ stats.time_to_spend|duration_tv }} ({{ stats.episodes_to_watch|plurialize('épisode', 'épisodes') }})
          </div>
          <div class="clearfix"></div>
        </div>
      </div>

      <div v-show="favorites.length">
        <h1 class="text-center">Favoris</h1>
        <div class="favorites">
          <span v-for="show in favorites">
            <router-link :to="{ name: 'show', params: { id: show._id }}" class="img">
              <img :src="getFavoriteImg(show)" width="200" :alt="show.title">
            </router-link>
          </span>
        </div>
      </div>

      <div v-show="news.length">
        <h1 class="text-center">News</h1>
        <div class="news">
          <div class="new" v-for="article in news">
            <div class="img" @click="openNews(article.url)" :style="bgNews(article)"></div>
              <div class="new-title" @click="openNews(article.url)">{{ article.title }}</div>
              <div class="date" :title="article.date | formatDate('ddd DD à HH[h]mm')">{{ article.date|fromNow }}</div>
          </div>
        </div>
      </div>
    </div>
</template>

<script>
  import { mapState } from 'vuex'

  import api from '../api'
  import { localStore, types } from '../store'
  import { Cache, Show } from '../db'

  export default {
    data () {
      return {
        stats: {},
        favorites: [],
        news: [],
      }
    },
    computed: {
      ...mapState(['isLogged']),
    },
    methods: {
      // Load member stats
      loadStats () {
        // Response
        let response = (infos) => {
          this.stats = Object.assign(infos.stats, {
            id: infos.id,
            avatar: infos.avatar,
            xp: infos.xp,
          })
        }

        // Load from cache
        let cacheId = 'summary'
        if (Cache.has(cacheId)) {
          let infos = Cache.get(cacheId, false)
          if (infos) {
            response(infos)
          }
        }

        // Load from API
        api.members.getInfos(true).then(response)
      },
      // Load favorites shows from DB
      loadFavorites () {
        if (localStore.get(localStore.key.HOMEPAGE.FAVORITE, true)) {
          Show.getFavorites().then((shows) => {
            this.favorites = shows
          })
        }
      },
      // Open the news
      openNews (url) {
        this.$store.dispatch(types.ACTIONS.OPEN_LINK, url)
      },
      // Get background style for the news
      bgNews (news) {
        if (news.picture_url) {
          return `background-image: url('${news.picture_url}');`
        }
        return ''
      },
      getFavoriteImg (favorite) {
        return api.shows.getShowImgUrl(favorite._id, 200, 295)
      },
    },
    watch: {
      // On stats update => redraw the graph
      stats (stats) {
        // Get data points
        let dataPoints = [
          { label: 'abandonnées', y: stats.shows_abandoned, color: '#fdbc40' },
          { label: 'en cours', y: stats.shows_current, color: '#34c84a' },
          { label: 'à voir', y: stats.shows_to_watch, color: '#004012' },
          { label: 'terminées', y: stats.shows_finished, color: '#fc605b' },
        ].filter((point) => {
          return point.y > 0
        })

        let CanvasJS = require('canvasjs')
        let chart = new CanvasJS.Chart('showChart', {
          animationEnabled: true,
          backgroundColor: '#181A1F',
          width: 400,
          height: 200,
          title: {
            text: `${stats.shows} séries (${stats.seasons} saisons)`,
          },
          data: [
            {
              type: 'doughnut',
              startAngle: 180,
              indexLabelFontSize: 14,
              indexLabel: '{y} {label}',
              toolTipContent: '{y} séries {label} : #percent%',
              dataPoints: dataPoints,
            },
          ],
        })
        console.log('[Home] Redraw the shows graph')
        chart.render()
      },
      // On logon => refresh stats and favorites
      isLogged (logged) {
        if (logged) {
          this.loadStats()
          this.loadFavorites()
        }
      },
    },
    mounted () {
      console.info('[VUE] Mount Homepage.vue')
      if (this.isLogged) {
        this.loadStats()
        this.loadFavorites()
      }

      // Get news
      if (localStore.get(localStore.key.HOMEPAGE.NEWS, true)) {
        let nbNews = localStore.get(localStore.key.HOMEPAGE.NB_NEWS, 10)
        api.news.getNews(nbNews).then((news) => {
          this.news = news
        })
      }
    },
  }
</script>

<style lang="scss">
  @import "../assets/scss/vars";
  .profil {
    h1.text-center {
      color: $txtColor;
    }
    .avatar {
      width: 130px;
      height: 130px;
      border-radius: 65px;
      margin: 20px 10px 0 10px;
      box-shadow: 7px 6px 10px #181A1F;
    }
    .cols {
      width: calc(100% - 160px);
    }
    .col20 {
      width: 20%;
    }
    .col60 {
      width: 60%;
    }
    .binfo {
      float: none;
      overflow: hidden;
    }
    #showChart {
      min-height: 200px;
      .canvasjs-chart-container {
        width: 400px;
        margin: auto;
      }
    }
    .linear-stats {
      .binfo {
        float: left;
        width: calc(50% - 10px);
      }
    }
    .favorites {
      max-height: 320px;
      display: block;
      overflow-y: hidden;
      overflow-x: auto;
      white-space: nowrap;
      padding-bottom: 10px;
      img {
        display: inline-block;
        margin: 5px;
        box-shadow: 7px 6px 12px #181A1F;
      }
      &::-webkit-scrollbar {
        height: 12px;
      }
    }
    .news {
      width: 100%;
      position: absolute;
      .new {
        position: relative;
        float: left;
        width: 45%;
        margin: 5px;
        .date {
          font-style: italic;
          float: right;
          color: $navTitle;
          margin-right: 15px;
        }
      }
      .img {
        width: 100px;
        float: left;
        height: 100px;
        background-size: cover;
        background-position: top center;
        background-color: #000000;
        cursor: pointer;
      }
      .new-title {
        font-weight: bold;
        margin-left: 110px;
        color: $navColor;
        cursor: pointer;
        &:hover {
          color: $navActiveColor;
        }
      }
    }
  }
</style>
