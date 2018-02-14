<template>
    <div class="profil">
      <div class="infos">
        <img :src="stats.avatar" alt="" class="avatar">

        <div class="fleft">
          <div class="binfo" v-if="stats.friends">
            <i class="fa fa-users"></i>
            {{ stats.friends|plurialize('ami', 'amis') }}
          </div>

          <div class="binfo">
            <i class="fa fa-certificate"></i>
            {{ stats.xp }} XP
          </div>

          <div class="binfo" v-if="stats.comments">
            <i class="fa fa-comments"></i>
            {{ stats.comments|plurialize('commentaire', 'commentaires') }}
          </div>
        </div>

        <div class="fleft">
          <div class="binfo">
            <div><i class="fa fa-clock"></i> {{ stats.time_on_tv|duration_tv }}</div>
            <div class="pull-right" v-if="stats.episodes">soit {{ stats.episodes|plurialize('épisode', 'épisodes') }} vus</div>
            <div class="clearfix"></div>
          </div>
          <div class="binfo" v-if="stats.time_to_spend">
            <i class="fa fa-hourglass"></i>
            Encore {{ stats.time_to_spend|duration_tv }} - {{ stats.episodes_to_watch|plurialize('épisode', 'épisodes') }}
          </div>

          <div class="binfo">
            <i class="fa fa-star"></i>
            "{{ stats.favorite_genre }}" à mater le {{ stats.favorite_day }}
          </div>
        </div>

        <div class="fleft">
          <div class="binfo">
            Épisodes :
            <ul>
              <li>{{ stats.episodes_per_month|plurialize('épisode', 'épisodes') }} / mois</li>
              <li>{{ stats.streak_days|plurialize('jour consécutif', 'jours consécutifs') }}</li>
            </ul>
          </div>
        </div>

        <div class="fleft">
          <div class="binfo">
            <div id="showChart"></div>
            <div class="clearfix"></div>
          </div>
        </div>
        <div class="clearfix"></div>
      </div>
    </div>
</template>

<script>
  import * as CanvasJS from 'canvasjs'
  import api from '../api'

  export default {
    data () {
      return {
        stats: {},
      }
    },
    mounted () {
      console.info('[VUE] Mount Homepage.vue')
      api.members.getInfos(true).then((infos) => {
        this.stats = Object.assign(infos.stats, {
          avatar: infos.avatar,
          xp: infos.xp,
        })
        // let CanvasJS = require('canvasjs-dilberd')
        let chart = new CanvasJS.Chart('showChart', {
          animationEnabled: true,
          backgroundColor: '#181A1F',
          title: {
            text: `${this.stats.shows} séries (${this.stats.seasons} saisons)`,
          },
          data: [
            {
              type: 'doughnut',
              startAngle: 180,
              indexLabel: '{y} {label}',
              toolTipContent: '{y} {label} : #percent%',
              dataPoints: [
                { label: 'abandonnées', y: this.stats.shows_abandoned },
                { label: 'en cours', y: this.stats.shows_current },
                { label: 'à voir', y: this.stats.shows_to_watch },
                { label: 'terminées', y: this.stats.shows_finished },
              ],
            },
          ],
        })
        chart.render()
      })
    },
  }
</script>

<style lang="scss">
  .profil {
    .infos {
      margin: 10px;
      .avatar {
        width: 130px;
        height: 130px;
        border-radius: 65px;
        float: left;
        margin-right: 20px;
        box-shadow: 7px 6px 10px #181A1F;
      }
      .binfo {
        float: none;
      }
    }
  }
  #showChart {
    width: 400px;
    height: 200px;
  }
</style>
