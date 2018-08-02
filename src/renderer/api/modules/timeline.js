import Vue from 'vue'

import { Cache } from '../../db'
import localStore from '../../store/local'

export default {
  cacheId: 'timeline',
  cacheTime: 60,
  /**
   * Get list of timeline
   * @returns {Promise}
   */
  getList () {
    // Get from cache
    if (Cache.isValid(this.cacheId)) {
      let events = Cache.get(this.cacheId)
      console.info('[API Cache] Timeline::getList', events)
      return Promise.resolve(events)
    }

    // API Request and cache
    console.info('[API] Timeline::getList')
    return this.request({}).then((events) => {
      Cache.set(this.cacheId, events, this.cacheTime)
      return Promise.resolve(events)
    })
  },
  /**
   * Load more event
   * @param event The last event
   * @returns {Promise}
   */
  getMore (event) {
    console.info('[API] Timeline::getMore', event)
    return this.request({
      since_id: event.id,
    }).then((events) => {
      // Update cache
      if (Cache.isValid(this.cacheId)) {
        let cacheEvents = Cache.get(this.cacheId, []).concat(events)
        Cache.update(this.cacheId, cacheEvents)
      }

      return Promise.resolve(events)
    })
  },
  /**
   * Request timeline API
   * @param params
   * @private
   * @returns {Promise}
   */
  request (params) {
    // Default params
    params = Object.assign({
      nbpp: localStore.get(localStore.key.TIMELINE.NB, 30),
      self: localStore.get(localStore.key.TIMELINE.HIMSELF, 0),
    }, params)

    // API Request
    return Vue.http.get('/timeline/friends', {
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
