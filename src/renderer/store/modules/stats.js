import { Stat } from '../../db'

const types = {
  ACTIONS: {
    LOAD_STATS: 'stats.load',
  },
  MUTATIONS: {
    SET_STATS: 'stats.list',
  },
  GETTERS: {
    ALL: 'stats.all',
  },
}

const state = {
  stats: [], // All stats
}

const mutations = {
  // Set list of total stats
  [types.MUTATIONS.SET_STATS] (state, stats) {
    state.stats = stats
  },
}

const actions = {
  // Load all stats
  [types.ACTIONS.LOAD_STATS] (context) {
    return Stat.find({
      value: { $ne: 0 },
    }).then((stats) => {
      let list = []
      stats.forEach((stat) => {
        let data = {
          date: new Date(stat.ts * 1000),
          type: stat.type,
          value: stat.value,
        }
        list.push(data)
      })
      list = list.sort((a, b) => {
        if (a.date - b.date !== 0) {
          return a.date - b.date
        }
        return a.type.localeCompare(b.type)
      })

      context.commit(types.MUTATIONS.SET_STATS, list)
      return Promise.resolve(list)
    })
  },
}

const getters = {
  // Get stats (with period)
  [types.GETTERS.ALL]: (state) => (period) => {
    return state.stats.filter((a) => {
      return a.date >= period
    })
  },
}

// Exports
export { types }
export default {
  state,
  mutations,
  actions,
  getters,
  strict: process.env.NODE_ENV !== 'production',
}
