<template>
  <div>
    <div class="pane-group">
      <div class="pane-sm sidebar">
        <nav class="nav-group">
          <h5 class="nav-group-title">Période</h5>
          <a class="nav-group-item" :class="{active: periodStr === '7d'}" @click="periodStr='7d'">7 jours</a>
          <a class="nav-group-item" :class="{active: periodStr === '1m'}" @click="periodStr='1m'" v-show="firstStat > 7">1 mois</a>
          <a class="nav-group-item" :class="{active: periodStr === '3m'}" @click="periodStr='3m'" v-show="firstStat > 21">3 mois</a>
          <a class="nav-group-item" :class="{active: periodStr === '1y'}" @click="periodStr='1y'" v-show="firstStat > 31">1 an</a>
        </nav>
      </div>
      <div class="pane">
        <h1 class="text-center">Statistiques</h1>

        <div class="text-center binfos-stats" v-for="(sum, iteration) in [sums, today]">
          <span class="binfo">
            <i class="fa fa-eye"></i>
            {{ sum.v|plurialize('épisode vu', 'épisodes vus') }}
            <span v-show="iteration">aujourd'hui</span>
          </span>

          <span class="binfo">
            <i class="fa fa-clock" style="color: #b1b400;"></i>
            {{ sum.t|duration_tv }}
            <span v-show="iteration">aujourd'hui</span>
          </span>

          <span class="binfo" v-show="sum.d">
            <i class="fa fa-download"></i>
            <span v-show="sum.d > 0">{{ sum.d|plurialize('épisode récupéré', 'épisodes récupérés') }}</span>
            <span v-show="sum.d < 0">{{ sum.d / -1|plurialize('épisode non récupéré', 'épisodes non récupérés')}}</span>
            <span v-show="iteration">aujourd'hui</span>
          </span>

          <span class="binfo stats-add" v-show="sum.a">
            <span v-show="sum.a > 0">
              <i class="fa fa-plus-circle"></i>
              {{ sum.a|plurialize('série ajoutée', 'séries ajoutées') }}
            </span>
            <span v-show="sum.a < 0">
              <i class="fa fa-minus-circle"></i>
              {{ sum.a / -1 |plurialize('série supprimée', 'séries supprimées') }}
            </span>
            <span v-show="iteration">aujourd'hui</span>
          </span>

          <span class="binfo" v-show="sum.r">
            <i class="fa fa-archive"></i>
            <span v-show="sum.r > 0">{{ sum.r|plurialize('série archivée', 'séries archivées') }}</span>
            <span v-show="sum.r < 0">{{ sum.r / -1|plurialize('série sortie des archives', 'séries sorties des archives') }}</span>
            <span v-show="iteration">aujourd'hui</span>
          </span>

          <span class="binfo" v-show="sum.s">
            <i class="fa fa-file-alt"></i>
            {{ sum.s|plurialize('sous-titre téléchargé', 'sous-titres téléchargés') }}
            <span v-show="iteration">aujourd'hui</span>
          </span>
          <div class="clearfix"></div>
        </div>

        <hr/>

        <div class="text-center binfo no-graph" v-show="firstStat > -1 && firstStat <= 1">
          Pas assez de données pour afficher les graphiques !
        </div>
        <div class="text-center binfo no-graph ellipse-loading" v-show="firstStat === -1" style="color: #FFFFFF;">
          Chargement en cours
        </div>

        <div v-show="firstStat > 1">
          <div style="width: 90%; margin: auto;">
            <div id="graphepisodes" class="graph-stats"></div>
            <div class="clearfix"></div>
          </div>

          <div style="width: 90%; margin: auto;">
            <div id="graphtime" class="graph-stats"></div>
            <div class="clearfix"></div>
          </div>

          <div style="width: 90%; margin: auto;">
            <div id="graphshow" class="graph-stats"></div>
          </div>

          <div style="width: 90%; margin: auto;">
            <div id="graphweek" class="graph-stats"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import moment from 'moment'
  import { types, localStore } from '../store'
  import StatsGraph from '../tools/StatsGraph'
  let graphs = new StatsGraph()

  export default {
    data () {
      return {
        periodStr: '',
        period: moment().subtract(1, 'months'),
        labelFormat: 'ddd DD',
        firstStat: -1,
      }
    },
    computed: {
      /**
       * All stats for current period
       * @return Stats[]
       */
      stats () {
        return this.$store.getters[types.stats.GETTERS.ALL](this.period)
      },
      /**
       * Get sum for current period
       * @return Object
       */
      sums () {
        return this.calculateSums(this.stats)
      },
      /**
       * Get sum for today
       * @return Object
       */
      today () {
        let stats = this.$store.getters[types.stats.GETTERS.ALL](moment().startOf('day'))
        return this.calculateSums(stats)
      },
    },
    methods: {
      /**
       * Update graph data
       * @param {Stats[]} stats
       */
      updateGraph (stats) {
        graphs
          .setStartDate(this.period)
          .setLabelFormat(this.labelFormat, 'episodes')
          .setLabelFormat(this.labelFormat, 'shows')
          .setLabelFormat(this.labelFormat, 'times')
          .setStats(stats)
        console.log('[GRAPH] Update')
      },
      /**
       * Calculate sums for a period
       * @param {Stats[]} stats
       * @return Object
       */
      calculateSums (stats) {
        let sums = {}

        stats.forEach((stat) => {
          if (sums.hasOwnProperty(stat.type)) {
            sums[stat.type] += stat.value
          } else {
            sums[stat.type] = stat.value
          }
        })

        return sums
      },
      drawGraph () {
        // Episodes
        graphs
          .addGraph('episodes', 'graphepisodes', 'Épisodes', {
            toolTip: {
              contentFormatter: (e) => {
                let str = `<span>${e.entries[0].dataPoint.label}</span><br>`
                e.entries.forEach((a) => {
                  if (a.dataSeries.visible) {
                    if (a.dataSeries.name === 'sous-titres') {
                      str += `<span style="color:${a.dataSeries.color}">${a.dataPoint.y} sous-titres téléchargés</span><br>`
                    } else {
                      str += `<span style="color:${a.dataSeries.color}">${a.dataPoint.y} épisodes ${a.dataSeries.name}</span><br>`
                    }
                  }
                })
                return str
              },
            },
          })
          .addSerie('vus', 'v', { color: '#0a67ac' })
          .addSerie('récupérés', 'd', { color: '#885dbb' })
          .addSerie('sous-titres', 's', { color: '#91bb2b' })

        // Time
        graphs
          .addGraph('times', 'graphtime', 'Temps passé', {
            axisY: {
              suffix: 'h',
            },
            toolTip: {
              contentFormatter: (e) => {
                let point = e.entries[0]
                return `<span>${point.dataPoint.label}</span><br>
                  <span style="color:${point.dataSeries.color}">${this.$options.filters.duration_tv(point.dataPoint.y * 60)}</span>`
              },
            },
          })
          .addSerie('Durée', 't', {
            color: '#b1b400',
            showInLegend: false,
            convertDataPoints: (dataPoints) => {
              for (let i = 0; i < dataPoints.length; i++) {
                dataPoints[i].y /= 60
              }
              return dataPoints
            },
          })

        // Shows
        graphs
          .addGraph('shows', 'graphshow', 'Séries', {
            axisY: {
              stripLines: [{
                value: 0,
                color: '#FF0000',
                lineDashType: 'dash',
              }],
            },
          })
          .addSerie('Ajouts', 'a', { color: '#4c8c75' })
          .addSerie('Archives', 'r', { color: '#fdbc40' })

        // Week
        graphs
          .addGraph('week', 'graphweek', 'Répartition', {
            width: 350,
            toolTip: {
              content: `<span style='"'color: {color};'"'>{y} épisodes vus le {label}</span> (#percent%)`,
            },
          })
          .addSerie('Vus', 'v', {
            type: 'doughnut',
            showInLegend: false,
            convertDataPoints: (dataPoints) => {
              let colorSet = ['#369EAD', '#C24642', '#7F6084', '#86B402', '#C8B631', '#948e91', '#FFA500']
              dataPoints = dataPoints.sort((a, b) => moment(a.date).format('e') - moment(b.date).format('e'))
              for (let i = 0; i < dataPoints.length; i++) {
                let day = moment(dataPoints[i].date).format('e')
                dataPoints[i].color = colorSet[day]
                dataPoints[i].indexLabelFontColor = colorSet[day]
              }
              return dataPoints
            },
          })
          .setLabelFormat('dddd')
        console.log('[GRAPH] Create')
        return Promise.resolve()
      },
    },
    watch: {
      /**
       * When update stats list : redraw graph
       * @param {Stats[]} stats
       */
      stats (stats) {
        this.updateGraph(stats)
      },
      firstStat () {
        setTimeout(() => {
          this.updateGraph(this.stats)
        }, 50)
      },
      /**
       * When update period : refresh moment, graph
       * @param {String} value
       */
      periodStr (value) {
        let period = moment().startOf('day')
        switch (value) {
          case '1d': // Today
            this.period = moment().startOf('day')
            break
          case '7d': // 1 week
            this.period = period.subtract(7, 'days').add('10', 'seconds')
            this.labelFormat = 'ddd DD'
            break
          case '1m': // 1 month
            this.period = period.subtract(1, 'months')
            this.labelFormat = 'ddd DD MMM'
            break
          case '3m': // 3 month
            this.period = period.subtract(3, 'months').startOf('week')
            this.labelFormat = '[S]w (MMM)'
            break
          case '1y': // 1 year
            this.period = period.startOf('month').subtract(1, 'years')
            this.labelFormat = 'MMM YYYY'
            break
        }
        console.log('[Stats] >=', this.period.format('DD/MM/YYYY'))

        // Save and update graph
        if (value !== localStore.get(localStore.key.STATS.PERIOD, '7d')) {
          localStore.set(localStore.key.STATS.PERIOD, value)
        }
        setTimeout(() => {
          this.updateGraph(this.stats)
        }, 50)
      },
    },
    mounted () {
      console.log('[VUE] Mount Statistics')
      this.periodStr = localStore.get(localStore.key.STATS.PERIOD, '7d')

      // Get stats
      this.$store.dispatch(types.stats.ACTIONS.LOAD_STATS).then((stats) => {
        this.drawGraph().then(() => {
          this.updateGraph(stats)
        })
        if (stats.length) {
          this.firstStat = moment().diff(moment(stats[0].date), 'days')
          console.log('[STATS] First :', this.firstStat, 'days ago')
        }
      })
    },
    destroyed () {
      this.$store.commit(types.stats.MUTATIONS.SET_STATS, [])
    },
  }
</script>

<style lang="scss">
  .binfos-stats {
    .binfo {
      display: inline-block;
      float: none;
    }
    .stats-add .fa {
      color: #4c8c75;
    }
  }
  .graph-stats {
    min-height: 300px;
    margin-bottom: 25px;
    width: 95%;
    .canvasjs-chart-container {
      /*width: 600px;*/
      margin: auto;
    }
    &.hide {
      opacity: 0;
    }
  }
  .no-graph {
    float: none;
    color: tomato;
  }
</style>
