<template>
  <div>
    <ul class="list-group">
      <li class="list-group-header"><input id="search" type="search" class="form-control" v-model="query" autofocus></li>
      <li class="list-group-item text-center" v-show="isSearching">
        <i class="fa fa-spinner fa-spin fa-pull-left"></i> <span class="ellipse-loading">Recherche en cours</span>
      </li>
      <li class="list-group-item text-center" v-show="noResult">Aucun résultats</li>

      <li class="list-group-item show-item" v-for="show in results" @contextmenu.prevent="$refs.ShowCtx.$refs.ctx.open($event, show)">
        <show-item :show="show">&nbsp;</show-item>
      </li>
    </ul>
    <show-ctx ref="ShowCtx">&nbsp;</show-ctx>
  </div>
</template>

<script>
  import api from '../api'
  import ShowCtx from './context/ShowCtx'
  import ShowItem from './ShowItem'

  let delayQuery

  export default {
    components: {
      ShowItem,
      ShowCtx,
    },
    data () {
      return {
        query: '',
        results: [],
        isSearching: false,
      }
    },
    computed: {
      noResult () {
        return (!this.results.length && !this.isSearching && this.query !== '' && !delayQuery)
      },
    },
    watch: {
      query (query) {
        clearTimeout(delayQuery)
        if (query.length) {
          delayQuery = setTimeout(() => {
            this.results = []
            this.isSearching = true
            api.shows.search(query).then((results) => {
              this.isSearching = false
              this.results = results
              delayQuery = null
            })
          }, 750)
        } else {
          this.results = []
        }
      },
    },
    mounted () {
      console.info('[VUE] Mount Search.vue')
      document.getElementById('search').focus()
    },
  }
</script>
