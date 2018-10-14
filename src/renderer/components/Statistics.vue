<template>
  <div>
    <div class="pane-group">
      <div class="pane-sm sidebar">
        <nav class="nav-group">
          <h5 class="nav-group-title">Période</h5>
          <a class="nav-group-item" :class="{active: period === 86400}" @click="period=86400">24 heures</a>
          <a class="nav-group-item" :class="{active: period === 604800}" @click="period=604800">7 jours</a>
          <a class="nav-group-item" :class="{active: period === 18144000}" @click="period=18144000">1 mois</a>
          <a class="nav-group-item" :class="{active: period === 31536000}" @click="period=31536000">1 an</a>
        </nav>
      </div>
      <div class="pane">
        <h1 class="text-center">Statistiques</h1>

        <ul>
          <li v-for="stat in stats">
            {{ stat.date | formatDate('D/M/Y')}} : {{ typeText(stat.type, stat.value )}}
            ({{ stat }})
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
  import { types, localStore } from '../store'

  export default {
    data () {
      return {
        period: localStore.get(localStore.key.STATS.PERIOD, 31536000),
      }
    },
    computed: {
      stats () {
        return this.$store.getters[types.stats.GETTERS.ALL](this.period)
      },
    },
    methods: {
      typeText (type, value) {
        switch (type) {
          case 'v':
            return this.$options.filters.plurialize(value, 'épisode vu', 'épisodes vus')

          case 'd':
            if (value >= 0) {
              return this.$options.filters.plurialize(value, 'épisode récupéré', 'épisodes récupérés')
            } else {
              value = value / -1
              return this.$options.filters.plurialize(value, 'épisode non récupéré', 'épisodes non récupérés')
            }

          case 'a':
            if (value >= 0) {
              return this.$options.filters.plurialize(value, 'série ajoutée', 'séries ajoutées')
            } else {
              return this.$options.filters.plurialize(value, 'série supprimée', 'séries supprimées')
            }

          case 'r':
            if (value >= 0) {
              return this.$options.filters.plurialize(value, 'série archivée', 'séries archivées')
            } else {
              value = value / -1
              return this.$options.filters.plurialize(value, 'série sortie des archives', 'séries sorties des archives')
            }

          case 's':
            return this.$options.filters.plurialize(value, 'sous-titre téléchargé', 'sous-titres téléchargés')
        }

        return value + ' ' + type
      },
    },
    watch: {
      period (value) {
        if (value !== localStore.get(localStore.key.STATS.PERIOD, 31536000)) {
          localStore.set(localStore.key.STATS.PERIOD, value)
        }
      },
    },
    mounted () {
      console.log('[VUE] Mount Statistics')
      this.$store.dispatch(types.stats.ACTIONS.LOAD_STATS).then((stats) => {
        console.log('Load stats', stats)
      })
    },
  }
</script>
