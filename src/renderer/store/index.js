import Vue from 'vue'
import Vuex from 'vuex'

import state from './state'
import getters, { types as gettersTypes } from './getters'
import mutations, { types as mutationsTypes } from './mutations'
import actions, { types as actionsTypes } from './actions'
import modules, { types as moduleTypes } from './modules'

Vue.use(Vuex)

// Types
let types = {
  GETTERS: gettersTypes,
  MUTATIONS: mutationsTypes,
  ACTIONS: actionsTypes,
  ...moduleTypes,
}

// Exports
export { types }
export localStore from './local'
export default new Vuex.Store({
  state,
  getters,
  mutations,
  actions,
  modules,
  strict: process.env.NODE_ENV !== 'production',
})
