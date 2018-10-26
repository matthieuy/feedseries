<template>
  <div v-show="show">
    <h1 class="text-center">Recommander {{ show.title }}</h1>

    <fieldset>
      <legend>
        Amis ({{ selected.length|plurialize('sélectionné', 'sélectionnés') }})
      </legend>
      <div class="friendslist">
        <span class="friend" v-for="friend in friends" @click="clickFriend(friend)" :class="{selected: isSelected(friend)}">{{ friend.login }}</span>
      </div>
    </fieldset>

    <fieldset>
      <legend>Commentaire</legend>
      <div class="form-group">
        <input type="text" v-model="comment" class="form-control" placeholder="Votre message à envoyer" />
      </div>
    </fieldset>

    <div class="text-center">
      <button id="btn-send" class="btn btn-default" @click="send()" :class="{disabled: !selected.length}" :disabled="!selected.length">
        <i class="fa fa-share-square"></i>&nbsp;Envoyer
      </button>
    </div>
  </div>
</template>

<script>
  import { mapState } from 'vuex'

  import api from '../../api'
  import { types, localStore } from '../../store'

  export default {
    data () {
      return {
        selected: [],
        comment: '',
        friends: [],
      }
    },
    computed: {
      ...mapState({
        show: state => state.show.show,
      }),
    },
    methods: {
      /**
       * Send suggests
       */
      send () {
        this.selected.forEach((friend, i) => {
          api.recommendations.create(this.show, friend.id, this.comment)
            .then(() => {
              /* eslint-disable no-new */
              new window.Notification('FeedSeries', {
                body: `Recommandation envoyée à ${friend.login}`,
                icon: localStore.getIconPath(true),
              })
            })
            .catch((e) => {
              alert(e.message)
              this.selected.push(friend)
            })
        })
        this.selected = []
        this.comment = ''
        this.$store.dispatch(types.recommendations.ACTIONS.LOAD_RECOMMENDATIONS)
      },
      /**
       * Clic on a friend name
       * @param {Object} friend
       */
      clickFriend (friend) {
        let index = this.selected.findIndex((a) => a.id === friend.id)
        if (index < 0) {
          this.selected.push(friend)
        } else {
          this.selected.splice(index, 1)
        }
      },
      isSelected (friend) {
        return this.selected.findIndex((a) => a.id === friend.id) >= 0
      },
      /**
       * Get friend list
       */
      getFriendsList () {
        return api.friends.getList().then((friends) => {
          this.friends = friends
            .filter(friend => friend.in_account)
            .sort((a, b) => {
              return a.login.localeCompare(b.login)
            })
        })
      },
    },
    mounted () {
      this.comment = ''
      this.getFriendsList()
    },
    beforeRouteUpdate (to, from, next) {
      this.comment = ''
      this.selected = []
      next()
    },
  }
</script>

<style lang="scss">
  @import "../../assets/scss/vars";
  .friendslist {
    .friend {
      display: inline-block;
      background-color: #a82d2d;
      margin: 5px;
      padding: 2px 5px;
      cursor: pointer;
      border-radius: 5px;
      &.selected {
        background-color: #046b11;
      }
    }
  }
  #btn-send.disabled {
    background-image: linear-gradient(to bottom, #939393 0%, #c1c1c1 100%);
    cursor: not-allowed;
  }
</style>
