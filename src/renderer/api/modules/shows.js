import Vue from 'vue'

import { Cache, Episode, Show, Subtitle } from '../../db'
import store, { localStore, types } from '../../store'

export default {
  /**
   * Get all shows
   * @return {Promise}
   */
  getList () {
    console.info('[API] Shows::getList')
    return Vue.http.get('/members/infos', {
      params: {
        only: 'shows',
      },
    }).then((response) => {
      if (response.status === 200 && response.data.hasOwnProperty('member')) {
        let member = response.data.member

        // Options
        if (member.hasOwnProperty('options') && member.options.hasOwnProperty('specials')) {
          localStore.set(localStore.key.EPISODES.SPECIAL, member.options.specials)
        }

        // Save shows in DB
        if (member.hasOwnProperty('shows')) {
          let promises = []

          member.shows.forEach((show) => {
            let p = new Promise((resolve, reject) => {
              Show.findOneAndUpdate({_id: show.id + ''}, Show.cleanProperties(show), {upsert: true}).then((showSaved) => {
                resolve(showSaved)
              })
            })
            promises.push(p)
          })

          // Cache summary
          delete member.shows
          delete member.favorites
          delete member.favorite_movies
          Cache.set('summary', member, 30)

          // Resolve all promises
          return Promise.all(promises)
        } else {
          return Promise.reject(new Error('Impossible de récupérer la liste des séries'))
        }
      }
    }).catch(() => {
      return Promise.reject(new Error('Impossible de récupérer la liste des séries'))
    })
  },
  /**
   * Get Episodes of a show
   * @param {Show} show
   * @return {Promise}
   */
  getEpisodes (show) {
    console.info('[API] Shows::episodes', show)
    return Vue.http.get('/shows/episodes', {
      params: {
        id: show._id,
        subtitles: true,
      },
    }).then((response) => {
      let episodes = response.data.episodes
      let srtVFOnly = localStore.get(localStore.key.EPISODES.SRT_VF_ONLY, true)
      let nbSubtitles = 0
      let nbEpisodes = 0

      let promises = []
      episodes.forEach(async (episode) => {
        // Update episode
        let p = new Promise((resolve, reject) => {
          Episode.findOneAndUpdate({_id: episode.id + ''}, Episode.cleanProperties(episode), {upsert: true}).then((episodeSaved) => {
            nbEpisodes++
            resolve(episodeSaved)
          })
        })
        promises.push(p)

        // Update subtitles
        episode.subtitles.forEach((subtitle) => {
          if ((srtVFOnly && (subtitle.language === 'VF')) || !srtVFOnly) {
            Subtitle.findOneAndUpdate({ _id: subtitle.id + '' }, Subtitle.cleanProperties(subtitle, episode), { upsert: true })
            nbSubtitles++
          }
        })
      })
      store.dispatch(types.subtitles.ACTIONS.LOAD_SUBTITLES)
      if (nbEpisodes) {
        console.info(`[DB] Update ${nbEpisodes} episodes`)
      }
      if (nbSubtitles) {
        console.info(`[DB] Update ${nbSubtitles} subtitles`)
      }

      return Promise.all(promises)
    })
  },

  /**
   * Get a show summary
   * @param {Number} showId
   * @return {Promise}
   */
  get (showId) {
    let cacheId = 'show_summary-' + showId

    // Get from cache
    if (Cache.isValid(cacheId)) {
      console.info('[API Cache] Shows::get', showId)
      return Promise.resolve(Cache.get(cacheId, null))
    }

    // Request
    console.info('[API] Shows::get', showId)
    return Vue.http.get('/shows/display', {
      params: {
        id: showId,
      },
    }).then((response) => {
      if (response.status === 200 && response.data.hasOwnProperty('show')) {
        let show = Show.cleanProperties(response.data.show)
        Show.findOneAndUpdate({ _id: show._id }, show, { upsert: true })
        this.setCache(show)

        return Promise.resolve(show)
      }
      return Promise.reject(new Error('Impossible de récupérer la série'))
    }).catch((e) => {
      return Promise.reject(e)
    })
  },
  /**
   * Add a show
   * @param {Show} show
   * @return {Promise}
   */
  add (show) {
    console.info('[API] Shows::add', show)
    Cache.invalidate('episodes_unseen')
    return Vue.http.post('/shows/show', {
      id: show._id,
    })
      .then((response) => {
        let show = Show.cleanProperties(response.data.show)
        this.setCache(show)
        let showId = (show._id) ? show._id : show.id
        let showSaved = Show.findOneAndUpdate({ _id: showId }, show, { upsert: true })
        return (showSaved) ? Promise.resolve(showSaved) : Promise.resolve(show)
      })
      .catch((e) => {
        if (e.data && e.data.hasOwnProperty('errors') && e.data.errors.length && e.data.errors[0].code === 2003) {
          Cache.invalidateByTags({show: show._id})
          return Promise.resolve(show)
        }
        console.error('Error add show', e)
        return Promise.reject(new Error('Impossible de rajouter la série'))
      })
  },
  /**
   * Delete a show
   * @param {Show} show
   * @return {Promise}
   */
  delete (show) {
    console.info('[API] Shows::delete', show)
    Cache.invalidateByTags({show: show._id})
    Cache.invalidate('episodes_unseen')
    return Vue.http.delete('/shows/show', {
      params: {
        id: show._id,
      },
    }).then((response) => {
      show = Show.cleanProperties(response.data.show)
      let promises = [
        Show.deleteOne({ _id: show._id }),
        Episode.deleteMany({ show: show._id }),
        Subtitle.deleteMany({ showId: show._id }),
      ]

      return Promise.all(promises).then(() => {
        return Promise.resolve(show)
      })
    }).catch((response) => {
      return Promise.reject(response)
    })
  },
  /**
   * Archive a show
   * @param {Show} show
   * @return {Promise}
   */
  archive (show) {
    console.info('[API] Shows::archive', show)
    Cache.invalidate('episodes_unseen')
    return Vue.http.post('/shows/archive', {
      id: show._id,
    })
      .then((response) => {
        let show = Show.cleanProperties(response.data.show)
        this.setCache(show)
        return Show.findOne({ _id: show.id })
      })
      .catch(() => {
        return Promise.reject(new Error('Impossible d\'archiver la série'))
      })
  },
  /**
   * Unarchive a show
   * @param {Show} show
   * @return {Promise}
   */
  unarchive (show) {
    console.info('[API] Shows::unarchive', show)
    Cache.invalidate('episodes_unseen')
    return Vue.http.delete('/shows/archive', {
      params: {
        id: show._id,
      },
    })
      .then((response) => {
        let show = Show.cleanProperties(response.data.show)
        this.setCache(show)
        return Show.findOne({ _id: show.id })
      })
      .catch(() => {
        return Promise.reject(new Error('Impossible de sortir la série'))
      })
  },
  /**
   * Add a favorite
   * @param {Show} show
   * @return {Promise}
   */
  favorite (show) {
    console.info('[API] Shows::favorite', show)
    return Vue.http.post('/shows/favorite', {
      id: show._id,
    }).then((response) => {
      let show = Show.cleanProperties(response.data.show)
      this.setCache(show)
      return Show.findOne({ _id: show.id })
    }).catch(() => {
      return Promise.reject(new Error('Impossible de mettre la série en favoris'))
    })
  },
  /**
   * Remove a favorite
   * @param {Show} show
   * @return {Promise}
   */
  unfavorite (show) {
    console.info('[API] Shows::unfavorite', show)
    return Vue.http.delete('/shows/favorite', {
      params: {
        id: show._id,
      },
    }).then((response) => {
      let show = Show.cleanProperties(response.data.show)
      this.setCache(show)
      return Show.findOne({ _id: show.id })
    }).catch(() => {
      return Promise.reject(new Error('Impossible d\'enlever la série des favoris'))
    })
  },
  /**
   * Get characters
   * @param {Show} show
   * @return {Promise}
   */
  characters (show) {
    let cacheId = `characters-${show._id}`
    if (Cache.isValid(cacheId)) {
      console.info('[API Cache] Shows::characters', show)
      return Promise.resolve(Cache.get(cacheId))
    }

    // Api request
    console.info('[API] Shows::characters', show)
    return Vue.http.get('/shows/characters', {
      params: {
        id: show._id,
      },
    }).then((response) => {
      let characters = response.data.characters
      Cache.set(cacheId, characters, 1440, {show: show._id})

      return Promise.resolve(characters)
    })
  },
  /**
   * Get similars shows
   * @param {Show} show
   * @return {Promise}
   */
  similars (show) {
    let cacheId = `similars-${show._id}`
    if (Cache.isValid(cacheId)) {
      console.info('[API Cache] Shows::similars', show)
      return Promise.resolve(Cache.get(cacheId))
    }

    // API request
    console.info('[API] Shows::similars', show)
    return Vue.http.get('/shows/similars', {
      params: {
        id: show._id,
        details: true,
      },
    }).then((response) => {
      let similars = response.data.similars
      let results = []

      similars.forEach((similar) => {
        results.push(Show.cleanProperties(similar.show))
      })
      Cache.set(cacheId, results, 1440, {show: show._id})

      return Promise.resolve(results)
    })
  },
  /**
   * Search a show
   * @param {String} query
   * @return {Promise}
   */
  search (query) {
    console.info('[API] Shows::search', query)
    return Vue.http.get('/shows/search', {
      params: {
        title: query,
        summary: 1,
        nbpp: 10,
      },
    })
      .then((response) => {
        let shows = response.data.shows
        let result = []
        shows.forEach((show) => {
          result.push(Show.cleanProperties(show))
        })
        return Promise.resolve(result)
      })
  },
  /**
   * Get the url of the show image
   * @param {Integer} showId The show ID
   * @param {Integer|null} width Width of img
   * @param {Integer|null} height Height of img
   * @return {String} The URL
   */
  getShowImgUrl (showId, width, height) {
    let url = Vue.http.defaults.baseURL + '/pictures/shows?'
    url += 'v=' + Vue.http.defaults.headers.common['X-BetaSeries-Version']
    url += '&key=' + Vue.http.defaults.headers.common['X-BetaSeries-Key']
    url += '&id=' + showId
    if (typeof width !== 'undefined') {
      url += (typeof height !== 'undefined') ? '&width=' + width + '&height=' + height : '&width=' + width + '&height=' + width
    }
    return url
  },
  /**
   * Set show in cache
   * @param {Show} show
   * @private
   */
  setCache (show) {
    Cache.set('show_summary-' + show._id, show, 720, {show: show._id})
  },
}
