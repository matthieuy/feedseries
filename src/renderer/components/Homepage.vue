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
            <div class="binfo" v-if="stats.badges"><i class="fa fa-bookmark"></i> {{ stats.badges|plurialize('badge', 'badges') }}</div>
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
              <img :src="'https://www.betaseries.com/images/fonds/poster/' + show.poster" width="200" :alt="show.title">
            </router-link>
          </span>
        </div>
      </div>
    </div>
</template>

<script>
  import api from '../api'
  import { Show } from '../db'

  export default {
    data () {
      return {
        stats: {},
        favorites: [],
      }
    },
    methods: {
      // Load member stats
      loadStats () {
        api.members.getInfos(true).then((infos) => {
          this.stats = Object.assign(infos.stats, {
            id: infos.id,
            avatar: infos.avatar,
            xp: infos.xp,
          })
        })
      },
    },
    watch: {
      // On stats update => redraw the graph
      stats (stats) {
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
              dataPoints: [
                { label: 'abandonnées', y: stats.shows_abandoned, color: '#fdbc40' },
                { label: 'en cours', y: stats.shows_current, color: '#34c84a' },
                { label: 'à voir', y: stats.shows_to_watch, color: '#004012' },
                { label: 'terminées', y: stats.shows_finished, color: '#fc605b' },
              ],
            },
          ],
        })
        console.log('[Home] Redraw the shows graph')
        chart.render()
      },
    },
    mounted () {
      console.info('[VUE] Mount Homepage.vue')

      // Get stats
      this.loadStats()

      // Get favorites from DB
      Show.getFavorites().then((shows) => {
        this.favorites = shows
      })
    },
  }
</script>

<style lang="scss">
  .profil {
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
  }
</style>
