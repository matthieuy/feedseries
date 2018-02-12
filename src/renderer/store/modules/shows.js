import Vue from 'vue'

import api from '../../api'
import ConcurentPromise from '../../tools/ConcurentPromise'
import { Cache, Show } from '../../db'
import { types as typesRootAction } from '../actions'

const types = {
  MUTATIONS: {
    SET_SHOWS: 'shows.list',
    UPDATE_SHOW: 'shows.update',
    ADD: 'shows.add',
    DELETE: 'shows.delete',
  },
  ACTIONS: {
    LOAD_LIST: 'shows.list',
    ADD: 'shows.add',
    DELETE: 'shows.delete',
    ARCHIVE: 'shows.archive',
    UNARCHIVE: 'shows.unarchive',
    FAVORITE: 'shows.favorite',
    UNFAVORITE: 'shows.unfavorite',
  },
  GETTERS: {
    SHOWS: 'shows.getshows',
  },
}

const state = {
  shows: [], // Shows
}

const mutations = {
  /**
   * Set the shows list
   * @param state
   * @param shows
   */
  [types.MUTATIONS.SET_SHOWS] (state, shows) {
    state.shows = shows
  },
  /**
   * Update one show in the state list
   * @param state
   * @param show
   */
  [types.MUTATIONS.UPDATE_SHOW] (state, show) {
    for (let i = 0; i < state.shows.length; i++) {
      if (state.shows[i]._id === show._id) {
        Vue.set(state.shows, i, show)
        break
      }
    }
  },
  /**
   * Add a show to the state list
   * @param state
   * @param show
   */
  [types.MUTATIONS.ADD] (state, show) {
    state.shows.push(show)
  },

  /**
   * Remove a show
   * @param state
   * @param show
   */
  [types.MUTATIONS.DELETE] (state, show) {
    for (let i = 0; i < state.shows.length; i++) {
      if (state.shows[i]._id === show._id) {
        Vue.delete(state.shows, i)
        break
      }
    }
  },
}

const actions = {
  /**
   * On login : refresh member info and shows list
   * @param context
   * @return {Promise}
   */
  [typesRootAction.ON_LOGIN] (context) {
    let promises = new ConcurentPromise()
    promises.then(() => {
      Show.find({}).then((shows) => {
        context.commit(types.MUTATIONS.SET_SHOWS, shows)
      })
    })

    // API
    if (process.env.NODE_ENV !== 'development') {
      promises.addPromise(api.members.getInfos())
    }

    // DB : resolve directly to call then()
    promises.addPromise(new Promise((resolve, reject) => {
      resolve()
    }))

    return promises.race()
  },

  /**
   * Load the complete shows list
   * @param context
   * @return {Promise}
   */
  [types.ACTIONS.LOAD_LIST] (context) {
    let promises = new ConcurentPromise()
    promises.then((shows) => {
      context.commit(types.MUTATIONS.SET_SHOWS, shows)
    })

    // DB
    promises.addPromise(Show.find({}))

    // API
    promises.addPromise(api.shows.getList())

    return promises.race()
  },

  /**
   * Add a show
   * @param context
   * @param show
   * @return {Promise}
   */
  [types.ACTIONS.ADD] (context, show) {
    return api.shows.add(show).then((showAdded) => {
      context.commit(types.MUTATIONS.ADD, showAdded)
      return Promise.resolve(showAdded)
    })
  },

  /**
   * Delete a show
   * @param context
   * @param {Show} show
   * @return {Promise}
   */
  [types.ACTIONS.DELETE] (context, show) {
    return api.shows.delete(show).then((showDeleted) => {
      context.commit(types.MUTATIONS.DELETE, showDeleted)
      return Promise.resolve(showDeleted)
    }).catch((response) => {
      // Already delete
      if (response.data.errors && response.data.errors[0].code === 2004) {
        context.dispatch(types.show.ACTIONS.LOAD_SHOW, show._id)
      }
    })
  },

  /**
   * Archive a show
   * @param context
   * @param {Show} show
   * @return {Promise}
   */
  [types.ACTIONS.ARCHIVE] (context, show) {
    return context.dispatch('archiveAction', {
      show: show,
      archive: true,
    })
  },

  /**
   * Unarchive a show
   * @param context
   * @param {Show} show
   * @return {Promise}
   */
  [types.ACTIONS.UNARCHIVE] (context, show) {
    return context.dispatch('archiveAction', {
      show: show,
      archive: false,
    })
  },

  /**
   * Add a show to favorites
   * @param context
   * @param {Show} show
   * @return {Promise}
   */
  [types.ACTIONS.FAVORITE] (context, show) {
    return context.dispatch('favoriteAction', {
      show: show,
      favorite: true,
    })
  },

  /**
   * Remove a show to favorites
   * @param context
   * @param {Show} show
   * @return {Promise}
   */
  [types.ACTIONS.UNFAVORITE] (context, show) {
    return context.dispatch('favoriteAction', {
      show: show,
      favorite: false,
    })
  },

  /**
   * Archive or unarchive a show
   * @param context
   * @param obj
   * @private
   * @return {Promise}
   */
  archiveAction (context, obj) {
    let { show, archive } = obj
    let promises = new ConcurentPromise()

    // API
    if (archive) {
      promises.addPromise(api.shows.archive(show))
    } else {
      promises.addPromise(api.shows.unarchive(show))
    }
    promises.reverse(() => {
      Show.archive(show, !archive)
      promises.callThen(show)
    })

    // DB
    promises.addPromise(Show.archive(show, archive))

    promises.then((show) => {
      Cache.invalidateByTags({show: show.id})
      context.commit(types.MUTATIONS.UPDATE_SHOW, show)
    })

    return promises.race()
  },

  /**
   * Add/Remove a favorite
   * @param context
   * @param obj show and boolean
   * @private
   * @return {Promise}
   */
  favoriteAction (context, obj) {
    let { show, favorite } = obj
    let promises = new ConcurentPromise()

    // API
    if (favorite) {
      promises.addPromise(api.shows.favorite(show))
    } else {
      promises.addPromise(api.shows.unfavorite(show))
    }
    promises.reverse(() => {
      Show.favorite(show, !favorite)
      promises.callThen(show)
    })

    // DB
    promises.addPromise(Show.favorite(show, favorite))

    promises.then((show) => {
      Cache.invalidateByTags({show: show._id})
      context.commit(types.MUTATIONS.UPDATE_SHOW, show)
    })

    return promises.race()
  },
}

const getters = {
  /**
   * Get shows
   * @param state
   * @return {function()}
   */
  [types.GETTERS.SHOWS]: (state) => (status, order, reverse) => {
    // Filter
    let shows = state.shows.filter((show) => {
      if (typeof show.title === 'undefined') {
        return false
      }
      switch (status) {
        case 'current':
          return !show.isArchived && show.progress !== 100
        case 'active':
          return !show.isArchived && show.progress === 100
        case 'archived':
          return show.isArchived && show.status !== 'Ended'
        case 'ended':
          return show.isArchived && show.progress === 100 && show.status === 'Ended'
        default:
          return true
      }
    })

    // Order
    shows.sort((a, b) => {
      switch (order) {
        case 'alphabetical':
          return (typeof a.title !== 'undefined') ? a.title.localeCompare(b.title) : 0
        case 'progression':
          let s = a.progress - b.progress
          return (s !== 0) ? s : String(a.title).localeCompare(b.title)
        case 'remaining_time':
          return (a.remaining * parseInt(a.runtime)) - (b.remaining * parseInt(b.runtime))
        case 'remaining_episodes':
          return a.remaining - b.remaining
      }
    })

    // Reverse
    if (reverse) {
      shows.reverse()
    }

    return shows
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
