import Vue from 'vue'

import store, { localStore, types } from '../../store'
import { Cache, Episode, Subtitle } from '../../db'

export default {
  /**
   * Get unseen episodes
   * @return {Promise}
   */
  getList () {
    let cacheId = 'episodes_unseen'

    // Get from cache
    if (Cache.isValid(cacheId)) {
      console.info('[API Cache] Episodes::getList')
      return Promise.resolve(Cache.get(cacheId, []))
    } else {
      console.info('[API] Episodes::getList')

      // Params
      let params = {
        specials: localStore.get(localStore.key.EPISODES.SPECIAL, true),
        subtitles: (localStore.get(localStore.key.EPISODES.SRT_VF_ONLY, true)) ? 'vf' : 'all',
      }

      return Vue.http.get('/episodes/list', {
        params: params,
      }).then((response) => {
        let shows = response.data.shows
        let nbSubtitles = 0
        let episodes = []

        let promiseList = []
        shows.forEach((show) => {
          show.unseen.forEach(async (episode) => {
            // Update episode
            let p = new Promise((resolve, reject) => {
              Episode.findOneAndUpdate({_id: episode.id + ''}, Episode.cleanProperties(episode), {upsert: true}).then((episodeSaved) => {
                episodes.push(episodeSaved)
                resolve()
              })
            })
            promiseList.push(p)

            // Update subtitles
            episode.subtitles.forEach((subtitle) => {
              nbSubtitles++
              Subtitle.findOneAndUpdate({_id: subtitle.id + ''}, Subtitle.cleanProperties(subtitle, episode), {upsert: true})
            })
          })
        })

        return Promise.all(promiseList).then(() => {
          console.info(`[DB] Update ${episodes.length} episodes`)
          console.info(`[DB] Update ${nbSubtitles} subtitles`)
          store.dispatch(types.subtitles.ACTIONS.LOAD_SUBTITLES)
          Cache.set(cacheId, episodes, 3600)
          return Promise.resolve(episodes)
        })
      })
    }
  },

  /**
   * Mark episod as DL
   * @param {Episode} episode
   * @returns {Promise}
   */
  markDL (episode) {
    console.info('[API] Episodes:markDL', episode)
    return Vue.http.post('/episodes/downloaded', {
      id: episode._id,
    })
      .then((response) => {
        let episode = response.data.episode
        Cache.invalidate('episodes_unseen')
        return Episode.findOne({ _id: episode.id + '' })
      })
      .catch(() => {
        return Promise.reject(new Error('Impossible de marquer l\'épisode comme récupéré'))
      })
  },

  /**
   * Mark episode as not DL
   * @param {Episode} episode
   * @returns {Promise}
   */
  unmarkDL (episode) {
    console.info('[API] Episodes:unmarkDL', episode)
    return Vue.http.delete('/episodes/downloaded', {
      params: {
        id: episode._id,
      },
    })
      .then((response) => {
        let episode = response.data.episode
        Cache.invalidate('episodes_unseen')
        return Episode.findOne({ _id: episode.id + '' })
      })
      .catch(() => {
        return Promise.reject(new Error('Impossible de marquer l\'épisode comme non récupéré'))
      })
  },

  /**
   * Mark episode as view
   * @param {Episode} episode
   * @returns {Promise}
   */
  markView (episode) {
    console.info('[API] Episodes:markView', episode)
    return Vue.http.post('/episodes/watched', {
      id: episode._id,
      bulk: false,
    })
      .then((response) => {
        let episode = response.data.episode
        Cache.invalidate('episodes_unseen')
        return Episode.findOne({ _id: episode.id + '' })
      })
      .catch(() => {
        return Promise.reject(new Error('Impossible de marquer l\'épisode comme vu'))
      })
  },

  /**
   * Mark episode as view
   * @param {Episode} episode
   * @returns {Promise}
   */
  unmarkView (episode) {
    console.info('[API] Episodes:unmarkView', episode)
    return Vue.http.delete('/episodes/watched', {
      params: {
        id: episode._id,
      },
    })
      .then((response) => {
        let episode = response.data.episode
        Cache.invalidate('episodes_unseen')
        return Episode.findOne({ _id: episode.id + '' })
      })
      .catch(() => {
        return Promise.reject(new Error('Impossible de marquer l\'épisode comme non-vu'))
      })
  },

  /**
   * Scraper
   * @param {String} filename
   * @returns {Promise}
   */
  scraper (filename) {
    console.log('[API] Episodes::scraper', filename)
    return Vue.http.get('/episodes/scraper', {
      params: {
        file: filename,
      },
    })
      .then((response) => {
        return Promise.resolve(response.data.episode)
      })
      .catch((error) => {
        if (error.data.errors) {
          return Promise.reject(error.data.errors[0])
        }
        return Promise.reject(error)
      })
  },
}
