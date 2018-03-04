import api from '../../api'
import localStore from '../local'
import { types as typesRootAction } from '../actions'

const types = {
  MUTATIONS: {
    SET_RECOMMENDATIONS: 'recommendations.set',
  },
  ACTIONS: {
    LOAD_RECOMMENDATIONS: 'recommendations.load',
  },
  GETTERS: {
    NB_WAIT: 'recommendations.wait',
    ALL: 'recommendations.list',
  },
}

const state = {
  recommendations: [],
}

const mutations = {
  [types.MUTATIONS.SET_RECOMMENDATIONS] (state, recommendations) {
    state.recommendations = recommendations
  },
}

const actions = {
  [typesRootAction.ON_LOGIN] (context) {
    return context.dispatch(types.ACTIONS.LOAD_RECOMMENDATIONS)
  },
  [types.ACTIONS.LOAD_RECOMMENDATIONS] (context) {
    return api.recommendations.getList().then((recommendations) => {
      context.commit(types.MUTATIONS.SET_RECOMMENDATIONS, recommendations)
      return Promise.resolve(recommendations)
    })
  },
}

const getters = {
  [types.GETTERS.NB_WAIT]: (state) => {
    let userId = localStore.get(localStore.key.ID_USER, false)
    if (!userId) {
      return 0
    }

    return state.recommendations.filter((recommendation) => {
      return recommendation.status === 'wait' && recommendation.to_id === userId
    }).length
  },
  [types.GETTERS.ALL]: (state) => (filterName, status) => {
    let userId = localStore.get(localStore.key.ID_USER, false)
    if (!userId) {
      return []
    }

    let recommendations = state.recommendations.filter((recommendation) => {
      // Filter by filter
      if ((filterName === 'received' && recommendation.to_id !== userId) || (filterName === 'sended' && recommendation.from_id !== userId)) {
        return false
      }

      // Filter by status
      if (status !== 'all' && status !== recommendation.status) {
        return false
      }
      return true
    })

    recommendations.sort((a, b) => {
      let orderStatus = ['wait', 'accept', 'decline']
      for (let i = 0; i < orderStatus.length; i++) {
        if (a.status === orderStatus[i] && b.status !== orderStatus[i]) {
          return -1
        } else if (b.status === orderStatus[i] && a.status !== orderStatus[i]) {
          return 1
        }
      }

      if (a.status === b.status) {
        return b.id - a.id
      }

      return 0
    })

    return recommendations
  },
}

// Exports
export { types }
export default {
  state,
  mutations,
  actions,
  getters,
}
