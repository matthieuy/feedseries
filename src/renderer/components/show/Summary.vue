<template>
  <div v-show="show">
    <div class="binfo description">{{ show.description }}</div>
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
    <div class="binfo">
      <i class="fa fa-tag"></i>
      {{ show.genres|join(', ') }}
    </div>
    <div class="binfo">
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
</template>

<script>
  import { mapState } from 'vuex'

  export default {
    computed: {
      ...mapState({
        show: state => state.show.show,
      }),
    },
    mounted () {
      console.info('[VUE] Mount show:summary.vue')
    },
  }
</script>
