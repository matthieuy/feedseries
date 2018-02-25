import api from '../../api'

const types = {
  MUTATIONS: {
    SET_SHOW: 'show.set',
    SET_CHARACTERS: 'show.characters',
    SET_SIMILARS: 'show.similars',
    SET_COMMENTS: 'show.comments',
    ADD_COMMENTS: 'show.add_comments',
  },
  ACTIONS: {
    LOAD_SHOW: 'show.load',
    LOAD_CHARACTERS: 'show.characters',
    LOAD_SIMILARS: 'show.similars',
    LOAD_COMMENTS: 'show.comments',
    LOAD_MORE_COMMENTS: 'show.comments_more',
  },
}

const state = {
  show: false,
  characters: [],
  similars: [],
  comments: [],
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
  [types.MUTATIONS.SET_COMMENTS] (state, comments) {
    state.comments = comments
  },
  [types.MUTATIONS.ADD_COMMENTS] (state, comments) {
    state.comments = state.comments.concat(comments)
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
  [types.ACTIONS.LOAD_COMMENTS] (context, show) {
    return api.comments.getShow(show).then((comments) => {
      context.commit(types.MUTATIONS.SET_COMMENTS, comments)
      return Promise.resolve(comments)
    })
  },
  [types.ACTIONS.LOAD_MORE_COMMENTS] (context, show) {
    let last = context.state.comments[context.state.comments.length - 1]
    return api.comments.getShow(show, last).then((comments) => {
      context.commit(types.MUTATIONS.ADD_COMMENTS, comments)
      return Promise.resolve(comments)
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
