import api from '../../api'

const types = {
  MUTATIONS: {
    SET_EVENTS: 'timeline.events',
    ADD_EVENTS: 'timeline.add',
  },
  ACTIONS: {
    LOAD: 'timeline.load',
    LOAD_MORE: 'timeline.more',
  },
}

const state = {
  events: [], // Array of events
}

const mutations = {
  // Set events
  [types.MUTATIONS.SET_EVENTS] (state, events) {
    state.events = events
  },
  // Add array of events
  [types.MUTATIONS.ADD_EVENTS] (state, events) {
    state.events = state.events.concat(events)
  },
}

const actions = {
  // First load
  [types.ACTIONS.LOAD] (context) {
    return api.timeline.getList().then((events) => {
      context.commit(types.MUTATIONS.SET_EVENTS, events)
      return Promise.resolve()
    })
  },
  // Load more events
  [types.ACTIONS.LOAD_MORE] (context) {
    let lastEvent = context.state.events[context.state.events.length - 1]
    return api.timeline.getMore(lastEvent).then((events) => {
      context.commit(types.MUTATIONS.ADD_EVENTS, events)
      return Promise.resolve()
    })
  },
}

// Exports
export { types }
export default {
  state,
  mutations,
  actions,
  getters: {},
}
