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
              <li>Total : {{ stats.episodes }}</li>
              <li>{{ stats.episodes_per_month|plurialize('épisode', 'épisodes') }} / mois</li>
              <li>À voir : {{ stats.episodes_to_watch }}</li>
              <li>{{ stats.streak_days|plurialize('jour consécutif', 'jours consécutifs') }}</li>
            </ul>
          </div>
        </div>

        <div class="fleft">
          <div class="binfo">
            Séries :
            <ul>
              <li>Nombre : {{ stats.shows }}</li>
              <li>Saisons : {{ stats.seasons }}</li>
              <li>À voir : {{ stats.shows_to_watch }}</li>
              <li>Terminées : {{ stats.shows_finished }}</li>
              <li>En cours : {{ stats.shows_current }}</li>
              <li>Abandonnées : {{ stats.shows_abandoned }}</li>
            </ul>
          </div>
        </div>
        <div class="clearfix"></div>
      </div>
    </div>
</template>

<script>
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
        max-width: 340px;
      }
    }

  }
</style>
