<template>
  <div class="friends-seen">
    <i class="fa fa-users cursor" v-show="friends"></i>
    <div class="friends-content">
      Vu par :
      <div v-for="friend in friends">
        <img class="avatars" :src="avatarURL(friend.id)" width="20" height="20">
        {{ friend.login }}
      </div>
    </div>
  </div>
</template>

<script>
  import api from '../api'

  export default {
    props: ['friends'],
    methods: {
      avatarURL (userId) {
        return api.members.getAvatarURL(userId, 20)
      },
    },
  }
</script>
