<template>
  <div v-show="show" class="comments">
    <h1 class="text-center">{{ show.comments|plurialize('commentaire', 'commentaires')}}</h1>

    <div>
      <div class="comment" v-for="comment in rootComments">
        <img :src="comment.avatar" v-if="comment.avatar" width="40" height="40" />
        <img src="static/empty.png" v-if="!comment.avatar" width="40" height="40" />
        <span class="author">par {{ comment.login }}, <span :title="comment.date|formatDate('ddd DD MMM YYYY à HH:mm')">{{ comment.date|fromNow }}</span></span>
        <p>{{ comment.text }}</p>

        <div v-if="comment.replies" style="margin-left: 30px;">
          <div class="comment" v-for="reply in getReplies(comment.inner_id)">
            <img :src="reply.avatar" v-if="reply.avatar" width="40" height="40" />
            <img src="static/empty.png" v-if="!reply.avatar" width="40" height="40" />
            <span class="author">par {{ reply.login }}, <span :title="reply.date|formatDate('ddd DD MMM YYYY à HH:mm')">{{ reply.date|fromNow }}</span></span>
            <p>{{ reply.text }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="text-center" v-show="!disableMore && !isLoading">
      <div class="btn btn-nav" @click="loadMore()">
        <i class="fa fa-plus-circle"></i>
        Charger plus de commentaires
      </div>
    </div>

  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import { types } from '../../store'

  export default {
    data () {
      return {
        isLoading: true,
        disableMore: false,
      }
    },
    computed: {
      ...mapState({
        show: state => state.show.show,
        comments: state => state.show.comments,
      }),
      rootComments () {
        return this.comments.filter((comment) => {
          return comment.in_reply_to === 0
        })
      },
    },
    methods: {
      loadComments (show) {
        this.isLoading = true
        this.$store.commit(types.show.MUTATIONS.SET_COMMENTS, [])
        this.$store.dispatch(types.show.ACTIONS.LOAD_COMMENTS, show).then(() => {
          this.isLoading = false
        })
      },
      loadMore () {
        this.isLoading = true
        this.$store.dispatch(types.show.ACTIONS.LOAD_MORE_COMMENTS, this.show).then((comments) => {
          this.isLoading = false
          this.disableMore = (comments.length === 0)
        })
      },
      getReplies (innerId) {
        return this.comments.filter((comment) => {
          return comment.in_reply_to === innerId
        }).sort((a, b) => {
          return new Date(a.date) - new Date(b.date)
        })
      },
    },
    mounted () {
      console.info('[VUE] Mount show:comments')
    },
    beforeRouteEnter (to, from, next) {
      next(vm => {
        vm.loadComments({ _id: to.params.id })
      })
    },
    beforeRouteUpdate (to, from, next) {
      this.loadComments({ _id: to.params.id })
      next()
    },
  }
</script>

<style lang="scss">
  @import "../../assets/scss/vars";
  .comment {
    border: 1px solid $sidebarBorder;
    border-radius: 10px;
    padding: 5px 10px;
    margin-bottom: 10px;
    img {
      height: 40px;
      width: 40px;
      border-radius: 20px;
      vertical-align: middle;
      margin-right: 5px;
    }
    .author {
      font-style: italic;
      color: $navTitle;
    }
  }
</style>
