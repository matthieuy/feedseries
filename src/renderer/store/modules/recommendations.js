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

    console.log(state.recommendations)

    return state.recommendations.filter((recommendation) => {
      return recommendation.status === 'wait' && recommendation.to_id === userId
    }).length
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
