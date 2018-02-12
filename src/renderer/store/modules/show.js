import api from '../../api'

const types = {
  MUTATIONS: {
    SET_SHOW: 'show.set',
    SET_CHARACTERS: 'show.characters',
    SET_SIMILARS: 'show.similars',
  },
  ACTIONS: {
    LOAD_SHOW: 'show.load',
    LOAD_CHARACTERS: 'show.characters',
    LOAD_SIMILARS: 'show.similars',
  },
}

const state = {
  show: false,
  characters: [],
  similars: [],
}

const mutations = {
  [types.MUTATIONS.SET_SHOW] (state, show) {
    state.show = show
  },
  [types.MUTATIONS.SET_CHARACTERS] (state, characters) {
    state.characters = characters
  },
  [types.MUTATIONS.SET_SIMILARS] (state, similars) {
    state.similars = similars
  },
}

const actions = {
  [types.ACTIONS.LOAD_SHOW] (context, idShow) {
    return api.shows.get(idShow).then((show) => {
      context.commit(types.MUTATIONS.SET_SHOW, show)
      return Promise.resolve(show)
    })
  },
  [types.ACTIONS.LOAD_CHARACTERS] (context, show) {
    return api.shows.characters(show).then((characters) => {
      context.commit(types.MUTATIONS.SET_CHARACTERS, characters)
      return Promise.resolve(characters)
    })
  },
  [types.ACTIONS.LOAD_SIMILARS] (context, show) {
    return api.shows.similars(show).then((similars) => {
      context.commit(types.MUTATIONS.SET_SIMILARS, similars)
      return Promise.resolve(similars)
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
