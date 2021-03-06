import Vue from 'vue'
import moment from 'moment'

import api from '../../api'
import ConcurentPromise from '../../tools/ConcurentPromise'
import { Episode, Stat } from '../../db'
import { types as typesShows } from './shows'
import { localStore } from '../../store'

const types = {
  ACTIONS: {
    LOAD_UNSEEN: 'episodes.load.unseen',
    LOAD_EPISODES: 'episodes.load.season',
    MARK_DL: 'episodes.markdl',
    MARK_VIEW: 'episodes.view',
  },
  MUTATIONS: {
    SET_EPISODES: 'episodes.list',
    UPDATE_EPISODE: 'episode.update',
    SET_FINISH_SHOW: 'episode.finish',
  },
  GETTERS: {
    EPISODES_UNSEEN: 'episodes.unseen',
    SEASON_LIST: 'episodes.season_list',
    NB_DL: 'episodes.dl',
  },
}

const state = {
  episodes: [], // Episodes
  finishShow: false,
}

const mutations = {
  [types.MUTATIONS.SET_EPISODES] (state, episodes) {
    state.episodes = episodes
  },
  [types.MUTATIONS.UPDATE_EPISODE] (state, episode) {
    for (let i = 0; i < state.episodes.length; i++) {
      if (state.episodes[i]._id === episode._id) {
        Vue.set(state.episodes, i, episode)
        return true
      }
    }
    // Not found : add
    state.episodes.push(episode)
    return false
  },
  [types.MUTATIONS.SET_FINISH_SHOW] (state, show) {
    state.finishShow = show
  },
}

const actions = {
  /**
   * Get unseen episodes
   * @param context
   * @returns {Promise}
   */
  [types.ACTIONS.LOAD_UNSEEN] (context) {
    let promises = new ConcurentPromise()

    // Get from API
    promises.addPromise(api.episodes.getList())

    // Get from local DB
    promises.addPromise(Episode.getUnseen())

    // Set episodes list
    promises.then((episodes) => {
      context.commit(types.MUTATIONS.SET_EPISODES, episodes)
    })

    // DB vs API
    return promises.race()
  },
  /**
   * Load episode of a show
   * @param context
   * @param {Show} show
   * @returns {Promise}
   */
  [types.ACTIONS.LOAD_EPISODES] (context, show) {
    let promises = new ConcurentPromise()

    // API
    promises.addPromise(api.shows.getEpisodes(show))

    // DB
    promises.addPromise(Episode.find({ show: show._id }))

    promises.then((episodes) => {
      context.commit(types.MUTATIONS.SET_EPISODES, episodes)
    })

    return promises.race()
  },

  /**
   * Mark episode as DL or not
   * @param context
   * @param {Object} data (episode and isDL, nbEpisode)
   * @returns {Promise}
   */
  [types.ACTIONS.MARK_DL] (context, data) {
    let { episode, isDL, nbEpisode } = data
    if (typeof nbEpisode === 'undefined') {
      nbEpisode = 1
    }
    let promises = new ConcurentPromise()

    // API
    let promiseAPI = (isDL) ? api.episodes.markDL(episode) : api.episodes.unmarkDL(episode)
    promises
      .addPromise(promiseAPI)
      .reverse(() => {
        Episode.markDL(episode, !isDL)
        Stat.markDl(!isDL, nbEpisode)
        promises.callThen(episode)
      })

    // DB
    promises.addPromise(Episode.markDL(episode, isDL))
    Stat.markDl(isDL, nbEpisode)

    // Update episode in state
    promises.then((episode) => {
      context.commit(types.MUTATIONS.UPDATE_EPISODE, episode)
    })

    return promises.race()
  },

  /**
   * Mark episode as view
   * @param context
   * @param {Object} obj (episode, isView, nbEpisode)
   * @return {Promise}
   */
  [types.ACTIONS.MARK_VIEW] (context, obj) {
    let { episode, isView, nbEpisode } = obj
    if (typeof nbEpisode === 'undefined') {
      nbEpisode = 1
    }
    let promises = new ConcurentPromise()

    // API
    if (isView) {
      let p = api.episodes.markView(episode).then((ep) => {
        let archiveDay = localStore.get(localStore.key.EPISODES.DAY_BEFORE_ARCHIVE, 16)
        if (!context.state.finishShow && !ep.show.isArchived && (ep.show.remaining === 0) && (ep.show.status === 'Ended' || moment(String(episode.date)).diff(moment().subtract(archiveDay, 'days')) < 0)) {
          console.log('Série terminée :', ep.show.title)
          context.commit(types.MUTATIONS.SET_FINISH_SHOW, ep.show)
        }
        return Promise.resolve(ep)
      })
      promises.addPromise(p)
    } else {
      promises.addPromise(api.episodes.unmarkView(episode))
    }

    promises.reverse(() => {
      Episode.markView(episode, !isView)
      Stat.markView(!isView, nbEpisode)
      if (episode.show && episode.show.runtime) {
        Stat.addTimeView(episode.show.runtime, !isView, nbEpisode)
      }
      promises.callThen()
    })

    // DB
    promises.addPromise(Episode.markView(episode, isView))
    Stat.markView(isView, nbEpisode)
    if (episode.show && episode.show.runtime) {
      Stat.addTimeView(episode.show.runtime, isView, nbEpisode)
    }

    // Update episode in state
    promises.then((episode) => {
      context.commit(types.MUTATIONS.UPDATE_EPISODE, episode)
      context.commit(typesShows.MUTATIONS.UPDATE_SHOW, episode.show)
    })

    return promises.race()
  },
}

const getters = {
  /**
   * Get number of (not)downloaded episodes
   * @param dl {Boolean}
   * @return {Integer}
   */
  [types.GETTERS.NB_DL]: (state, getters) => (dl) => {
    let filterName = (dl) ? 'view' : 'get'
    return getters[types.GETTERS.EPISODES_UNSEEN](filterName).length
  },
  /**
   * Get unseen episodes
   * @return {[Episode]}
   */
  [types.GETTERS.EPISODES_UNSEEN]: (state) => (filterName, limit, order, reverse) => {
    let episodesByShow = {}
    let episodes = [].concat(state.episodes)
    episodes.sort((a, b) => {
      if (a.global === 0) {
        let s = a.season - b.season
        if (s !== 0) {
          return s
        }
        return a.episode - b.episode
      }
      return a.global - b.global
    })

    // Special
    let special = localStore.get(localStore.key.EPISODES.SPECIAL, true)

    // Filter
    episodes = episodes.filter((episode) => {
      // Base filter
      if (!episode.show || episode.show.isArchived || episode.isSeen) {
        return false
      }

      // Special
      if (!special && episode.special) {
        return false
      }

      // Show futur episode only if downloaded and "to seen view"
      let date = moment(String(episode.date), 'YYYY-MM-DD')
      if (episode.date && (!date.isValid() || date.isAfter(moment.now()))) {
        return false
      }

      return (
        filterName === 'all' || // All
        (filterName === 'get' && !episode.isDownloaded) || // not downloaded
        (filterName === 'view' && !episode.isSeen && episode.isDownloaded) // download
      )
    })

    // Order
    if (typeof order !== 'undefined') {
      episodes.sort((a, b) => {
        if (order === 'alpha') {
          if (a.show.title !== b.show.title) {
            return a.show.title.localeCompare(b.show.title)
          }

          return a.global - b.global
        } else {
          // No date
          if (!a.date) { return -1 }
          if (!b.date) { return 1 }
          let dateDiff = new Date(a.date + 'T00:00:00') - new Date(b.date + 'T00:00:00')
          if (dateDiff !== 0) {
            return dateDiff
          }

          if (a.episode !== b.episode) {
            return a.episode - b.episode
          }
          if (a.global !== b.global) {
            return a.global - b.global
          }
        }
      })
    }

    // Limit
    if (limit) {
      episodes = episodes.filter((episode) => {
        let idShow = (episode.show) ? episode.show._id || episode.show.id : episode._id || episode.id
        episodesByShow[idShow] = (episodesByShow.hasOwnProperty(idShow)) ? episodesByShow[idShow] + 1 : 1

        return (episodesByShow[idShow] <= limit)
      })
    }

    if (reverse) {
      episodes.reverse()
    }

    return episodes
  },
  /**
   * Get season list of a show
   * @param {Show} show
   * @return {Object}
   */
  [types.GETTERS.SEASON_LIST]: (state) => (show) => {
    let seasons = {}
    let special = localStore.get(localStore.key.EPISODES.SPECIAL, true)

    let episodes = state.episodes.map((a) => Object.assign({}, a))
    episodes.forEach((episode) => {
      // Show not loaded
      if (!episode.show) {
        episode.show = show
      }

      // Not this show
      if (episode.show._id !== show._id) {
        return false
      }

      // Special
      if (!special && episode.special) {
        return false
      }

      if (!seasons.hasOwnProperty(episode.season)) {
        seasons[episode.season] = {
          number: episode.season,
          episodes: [],
          seen: 0,
          progress: 0,
        }
      }
      seasons[episode.season].episodes.push(episode)
      seasons[episode.season].seen += (episode.isSeen) ? 1 : 0
      seasons[episode.season].progress = seasons[episode.season].seen / seasons[episode.season].episodes.length * 100
    })

    seasons = Object.values(seasons)
    seasons.sort((a, b) => {
      return a.number - b.number
    })
    seasons.forEach((season, i) => {
      seasons[i].episodes.sort((a, b) => {
        return a.episode - b.episode
      })
    })

    return seasons
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
