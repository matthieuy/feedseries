<template>
  <div>
    <div class="pull-left img-container">
      <router-link :to="{name: 'show', params: { id: show._id }}">
        <img v-bind:id="'poster' + show._id" src="static/empty.png" width="100" height="147" class="pull-left">
      </router-link>
    </div>
    <div class="box-info-container">
      <div class="box-info pull-left">
        <div>
          <h2 class="text-center">
            <router-link :to="{name: 'show', params: { id: show._id }}">{{ show.title }}</router-link>
            <span class="date">{{ show.creation }}</span>
            <span class="fa fa-circle" :style="show.status | statusColor"></span>
            <i class="fa fa-heart" v-show="show.isFavorited" title="Favoris"></i>
          </h2>
        </div>
        <p class="description" v-html="nl2br(show.description)"></p>
      </div>
      <div class="pull-right right-panel text-right">
        <div v-show="show.genres.length">{{ show.genres|join(', ') }}</div>
        <div v-show="show.network">{{ show.network }} <span class="fa fa-tv"></span></div>
        <div v-show="show.nb_episodes !== 0">{{ show.nb_seasons|plurialize('saison', 'saisons') }}, {{ show.nb_episodes|plurialize('épisode', 'épisodes')}}</div>
        <div v-show="show.runtime">{{ show.runtime|duration }} <span class="far fa-clock"></span></div>
        <div v-show="show.note">{{ show.note|round(1) }} <span class="fa fa-star"></span></div>
        <div>{{ show.followers }} <span class="fa fa-users"></span></div>
      </div>
    </div>
    <div class="text-center account-info" v-show="show.in_account">
      Série <span v-show="show.isArchived">(archivée)</span> déjà présente sur votre compte : {{ show.progress }}%<span v-show="show.remaining">, {{ show.remaining|plurialize('épisode', 'épisodes') }} à voir</span>
    </div>
    <div class="text-center account-info" v-if="show.friends">
      Série suivi par : {{ friendsName(show.friends) }}
    </div>
  </div>
</template>

<script>
  import api from '../api'

  export default {
    props: ['show'],
    methods: {
      nl2br (text) {
        return text.replace(/\n/g, '<br>')
      },
      friendsName (friends) {
        let logins = []
        friends.forEach((friend) => {
          logins.push(friend.login)
        })

        return logins.join(', ')
      },
      avatarURL (userId) {
        return api.members.getAvatarURL(userId, 20)
      },
    },
    mounted () {
      fetch(api.shows.getShowImgUrl(this.show._id, 100, 147)).then((response) => {
        if (response.status === 200) {
          document.getElementById('poster' + this.show._id).src = response.url
        }
      })
    },
  }
</script>
