import Vue from 'vue'

import { Cache } from '../../db'
import localStore from '../../store/local'

export default {
  cacheId: 'timeline',
  cacheTime: 60,
  /**
   * Get list of timeline
   * @param {string|int} showId
   * @returns {Promise}
   */
  getList (showId = '') {
    // Get from cache
    if (Cache.isValid(this.cacheId + showId)) {
      let events = Cache.get(this.cacheId + showId)
      console.info('[API Cache] Timeline::getList', showId, events)
      return Promise.resolve(events)
    }

    // API Request and cache
    console.info('[API] Timeline::getList', showId)
    return this.request({}, showId).then((events) => {
      Cache.set(this.cacheId + showId, events, this.cacheTime)
      return Promise.resolve(events)
    })
  },
  /**
   * Load more event
   * @param event The last event
   * @param {string|int} showId
   * @returns {Promise}
   */
  getMore (event, showId = '') {
    console.info('[API] Timeline::getMore', showId, event)
    return this.request({
      since_id: event.id,
    }, showId).then((events) => {
      // Update cache
      if (Cache.isValid(this.cacheId + showId)) {
        let cacheEvents = Cache.get(this.cacheId + showId, []).concat(events)
        Cache.update(this.cacheId + showId, cacheEvents)
      }

      return Promise.resolve(events)
    })
  },
  /**
   * Request timeline API
   * @param params
   * @param showId
   * @private
   * @returns {Promise}
   */
  request (params, showId = '') {
    // Default params
    params = Object.assign({
      nbpp: localStore.get(localStore.key.TIMELINE.NB, 30),
      self: localStore.get(localStore.key.TIMELINE.HIMSELF, 0),
    }, params)
    if (showId) {
      params.id = showId
    }

    // API Request
    let url = (showId) ? '/timeline/show' : '/timeline/friends'
    return Vue.http.get(url, {
      params,
    }).then((response) => {
      let events = []
      response.data.events.forEach((event) => {
        events.push({
          id: event.id,
          date: event.date,
          type: event.type,
          user: event.user,
          userId: event.user_id,
          html: event.html,
          ref: event.ref_id,
          note: (event.data.note) ? event.data.note : 0,
        })
      })

      return Promise.resolve(events)
    })
  },
}
