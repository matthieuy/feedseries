import localStore from './local'

const types = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  ADD_HISTORY: 'history.add',
  SET_HISTORY: 'history.set',
  CHANGE_HISTORY_SIZE: 'history.size',
}

const mutations = {
  // Set logged
  [types.LOGIN] (state, token) {
    state.isLogged = true
    state.isVerified = true
    localStore.set(localStore.key.TOKEN, token)
  },
  // Set not logged
  [types.LOGOUT] (state) {
    state.isLogged = false
    state.isVerified = false
    localStore.delete(localStore.key.TOKEN)
    localStore.purge()
  },
  // Add item to history
  [types.ADD_HISTORY] (state, obj) {
    let historySize = localStore.get(localStore.key.HISTORY_SIZE, 5)
    if (historySize === 0) {
      return false
    }

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
    state.history = state.history.splice(0, historySize)
    localStore.set(localStore.key.HISTORY, state.history)
  },
  // Set the history
  [types.SET_HISTORY] (state, history) {
    state.history = history
  },
  // Change the history size
  [types.CHANGE_HISTORY_SIZE] (state, size) {
    if (!size) {
      state.history = []
    } else if (size < state.history.length) {
      state.history = state.history.splice(0, size)
    }
    localStore.set(localStore.key.HISTORY_SIZE, size)
  },
}

export { types }
export default mutations
