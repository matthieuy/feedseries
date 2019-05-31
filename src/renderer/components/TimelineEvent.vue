<template>
  <li class="event">
    <img :class="'event-avatar-' + event.id" :src="userAvatar()" onerror="this.src='static/empty.png'" v-show="displayAvatar" alt="" width="24" height="24" />
    <i class="type-icon fa" :class="iconType(event.type)"></i>
    <span v-tooltip="$options.filters.formatDate(event.date, 'ddd DD MMM à HH[h]mm')">{{ event.date | fromNow }}</span>,
    {{ event.user }} <span v-html="event.html" :class="{link: isLinkEnabled()}" @click="clickLink($event)"></span>
    <span class="fa fa-star" v-show="event.note" v-for="star in event.note"></span>
  </li>
</template>

<script>
  import api from '../api'

  export default {
    props: {
      event: { type: Object, required: true },
      linkEnable: { default: true },
      displayAvatar: { default: true },
    },
    methods: {
      userAvatar () {
        return api.members.getAvatarURL(this.event.userId, 24)
      },
      iconType (type) {
        switch (type) {
          case 'markas':
            return 'fa-eye'
          case 'archive':
          case 'unarchive':
            return 'fa-archive'
          case 'add_serie':
            return 'fa-plus-circle'
          case 'recommandation':
          case 'recommandation_accept':
            return 'fa-thumbs-up'
          case 'recommandation_decline':
            return 'fa-thumbs-down'
          case 'del_serie':
            return 'fa-trash'
          case 'badge':
            return 'fa-trophy'
        }
      },
      isLinkEnabled () {
        let types = ['archive', 'unarchive', 'add_serie', 'del_serie']
        return this.linkEnable && types.indexOf(this.event.type) !== -1 && this.event.ref
      },
      clickLink (e) {
        console.log('Event :', this.event)
        e.preventDefault()
        if (this.isLinkEnabled(this.event)) {
          this.$router.push({ name: 'show', params: { id: this.event.ref } })
        }
      },
    },
  }
</script>
