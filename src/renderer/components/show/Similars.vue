<template>
  <div v-show="show">
    <ul class="list-group">
      <li class="list-group-header">
        <h1 class="text-center">{{ similars.length|plurialize('série similaire', 'séries similaires')}}</h1>
      </li>
      <li class="list-group-item show-item" v-for="show in similars" @contextmenu.prevent="$refs.ShowCtx.$refs.ctx.open($event, show)">
        <show-item :show="show">&nbsp;</show-item>
      </li>
    </ul>
    <show-ctx ref="ShowCtx">&nbsp;</show-ctx>
  </div>
</template>

<script>
  import { mapState } from 'vuex'

  import ShowItem from '../ShowItem'
  import ShowCtx from '../context/ShowCtx'
  import { types } from '../../store'

  export default {
    components: {
      ShowItem,
      ShowCtx,
    },
    computed: {
      ...mapState({
        show: state => state.show.show,
        similars: state => state.show.similars,
      }),
    },
    methods: {
      loadSimilars (show) {
        this.$store.dispatch(types.show.ACTIONS.LOAD_SIMILARS, show)
      },
    },
    mounted () {
      console.info('[VUE] Mount show:similars')
      this.loadSimilars(this.show)
    },
    beforeRouteUpdate (to, from, next) {
      this.$store.commit(types.show.MUTATIONS.SET_SIMILARS, [])
      this.loadSimilars({
        _id: to.params.id,
      })
      next()
    },
  }
</script>
