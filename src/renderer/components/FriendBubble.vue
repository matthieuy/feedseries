<template>
  <div class="friends-seen">
    <i class="fa fa-users cursor" v-show="friends"></i>
    <div class="friends-content">
      <span v-if="show">Suivi par :</span>
      <span v-if="!show">Vu par :</span>
      <div v-for="friend in friends">
        <img class="avatars" :src="avatarURL(friend.id)" onerror="this.src='static/empty.png'" width="20" height="20">
        {{ friend.login }}
      </div>
    </div>
  </div>
</template>

<script>
  import api from '../api'

  export default {
    props: {
      friends: Array,
      show: {
        type: Boolean,
        default: false,
      },
    },
    methods: {
      avatarURL (userId) {
        return api.members.getAvatarURL(userId, 20)
      },
    },
  }
</script>
