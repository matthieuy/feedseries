<template>
  <div class="recommendations-page">
    <div class="pane-group">
      <div class="pane-sm sidebar">
        <nav class="nav-group">
          <h5 class="nav-group-title">Filtre</h5>
          <a class="nav-group-item" :class="{active: filter === 'received'}" @click="filter = 'received'">
            <i class="fa fa-sign-in-alt"></i> Reçues
          </a>
          <a class="nav-group-item" :class="{active: filter === 'sended'}" @click="filter = 'sended'">
            <i class="fa fa-sign-out-alt"></i> Envoyées
          </a>
        </nav>
        <nav class="nav-group">
          <h5 class="nav-group-title">Status</h5>
          <a class="nav-group-item" :class="{active: status === 'wait'}" @click="status = 'wait'">
            <i class="fa fa-clock"></i> En attente
          </a>
          <a class="nav-group-item" :class="{active: status === 'accept'}" @click="status = 'accept'">
            <i class="fa fa-thumbs-up"></i> Acceptée
          </a>
          <a class="nav-group-item" :class="{active: status === 'decline'}" @click="status = 'decline'">
            <i class="fa fa-thumbs-down"></i> Refusée
          </a>
          <a class="nav-group-item" :class="{active: status === 'all'}" @click="status = 'all'">
            <i class="fa fa-handshake"></i> Toutes
          </a>
        </nav>
      </div>
      <div class="pane">
        <ul class="list-group list-recommendations">
          <li class="list-group-header">
            <h1 class="text-center">Recommandations</h1>
          </li>
          <li v-for="recommendation in recommendations" class="list-group-item" @contextmenu.prevent="$refs.RecommendationCtx.$refs.ctx.open($event, recommendation)">
            <span v-show="recommendation.to_id === userId">
              <i class="fa" :class="faIcon(recommendation.status)"></i>
              <img :src="userAvatar(recommendation.from_id)" class="avatar">
              {{ userName(recommendation.from_id) }}
              <span v-if="recommendation.status === 'wait'">vous recommande</span>
              <span v-else>vous a recommandé</span>
              "{{ showName(recommendation.show_id) }}"
              <div class="comment" v-show="recommendation.comments">
                {{ recommendation.comments }}
                <div class="clearfix"></div>
              </div>
            </span>
            <span v-show="recommendation.from_id === userId">
              <i class="fa" :class="faIcon(recommendation.status)"></i>
              <img :src="userAvatar(recommendation.to_id)" class="avatar">
              <span v-if="recommendation.status === 'wait'">Vous recommandez</span>
              <span v-else>Vous avez recommandé</span>
              "{{ showName(recommendation.show_id) }}"
              à {{ userName(recommendation.to_id) }}
              <div class="comment" v-show="recommendation.comments">
                {{ recommendation.comments }}
                <div class="clearfix"></div>
              </div>
            </span>
          </li>
        </ul>
      </div>
    </div>
    <recommendation-ctx ref="RecommendationCtx">&nbsp;</recommendation-ctx>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'

  import RecommendationCtx from './context/Recommandation'
  import api from '../api'
  import { Show } from '../db'
  import { types, localStore } from '../store'

  export default {
    components: {
      RecommendationCtx,
    },
    data () {
      return {
        filter: 'received',
        status: 'all',
        userId: false,
        friends: {},
        shows: {},
      }
    },
    computed: {
      ...mapGetters({
        nbRecommendations: types.recommendations.GETTERS.NB_WAIT,
      }),
      recommendations () {
        return this.$store.getters[types.recommendations.GETTERS.ALL](this.filter, this.status)
      },
    },
    methods: {
      userName (id) {
        return (this.friends.hasOwnProperty(id)) ? this.friends[id].login : 'un ami'
      },
      userAvatar (id) {
        return api.members.getAvatarURL(id, 24)
      },
      showName (id) {
        if (this.shows.hasOwnProperty(id)) {
          return this.shows[id].title
        }
        Show.getById(id).then((show) => {
          if (show) {
            this.$set(this.shows, id, show)
          } else {
            api.shows.get(id).then((show) => {
              this.$set(this.shows, id, show)
            })
          }
        })

        return 'une série (dont les informations sont en cours de chargement...)'
      },
      faIcon (status) {
        switch (status) {
          case 'accept':
            return 'fa-thumbs-up'
          case 'wait':
            return 'fa-clock'
          case 'decline':
            return 'fa-thumbs-down'
        }
      },
    },
    mounted () {
      this.userId = localStore.get(localStore.key.ID_USER, false)
      if (this.nbRecommendations) {
        this.status = 'wait'
      }

      // Load friend list
      api.friends.getList().then((friends) => {
        friends.forEach((friend) => {
          this.$set(this.friends, friend.id, friend)
        })
      })
    },
  }
</script>

<style lang="scss">
  @import "../assets/scss/vars";
  .recommendations-page {
    .fa-clock { color: #1a82fb; }
    .fa-thumbs-up { color: #91bb2b; }
    .fa-thumbs-down { color: #fb1710; }
  }
  .list-recommendations {
    .fa {
      vertical-align: middle;
    }
    .avatar {
      margin-left: 5px;
      margin-right: 2px;
      border-radius: 12px;
      vertical-align: middle;
    }
    .comment {
      margin-top: 5px;
      margin-left: 5px;
      font-style: italic;
      color: $navColor;
      white-space: normal;
    }
  }
</style>
