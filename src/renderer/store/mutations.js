import localStore from './local'

const types = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  ADD_HISTORY: 'history.add',
  SET_HISTORY: 'history.set',
}

const mutations = {
  // Set logged
  [types.LOGIN] (state, token) {
    state.isLogged = true
    localStore.set(localStore.key.TOKEN, token)
  },
  // Set not logged
  [types.LOGOUT] (state) {
    state.isLogged = false
    localStore.delete(localStore.key.TOKEN)
  },
  // Add item to history
  [types.ADD_HISTORY] (state, obj) {
    let { show, route } = obj
    let item = {
      label: show.title,
      path: route.path,
    }

    // Check and remove history double entries
    let index = state.history.findIndex((history) => {
      return item.label === history.label
      // return JSON.stringify(item) === JSON.stringify(history)
    })
    if (index > -1) {
      state.history.splice(index, 1)
    }

    // Add into history and save
    state.history.unshift(item)
    state.history = state.history.splice(0, 5)
    localStore.set(localStore.key.HISTORY, state.history)
  },
  // Set the history
  [types.SET_HISTORY] (state, history) {
    state.history = history
  },
}

export { types }
export default mutations
