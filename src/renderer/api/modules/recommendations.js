import Vue from 'vue'

import { Cache } from '../../db'

export default {
  cacheId: 'recommendation',
  cacheTtl: 7200,

  /**
   * Get recommandation promise
   * @return {Promise}
   */
  getList () {
    if (Cache.isValid(this.cacheId)) {
      let list = Cache.get(this.cacheId)
      console.log('[API Cache] Recommendations:getList')
      return Promise.resolve(list)
    }

    console.log('[API] Recommendations:getList')
    return Vue.http.get('/shows/recommendations').then((response) => {
      if (response.status === 200 && response.data.hasOwnProperty('recommendations')) {
        let recommendations = response.data.recommendations
        Cache.set(this.cacheId, recommendations, this.cacheTtl)
        return Promise.resolve(recommendations)
      }
    })
  },
  /**
   * Change status of a recommendation
   * @param {Integer} id
   * @param {String} status
   * @return {Promise}
   */
  changeStatus (id, status) {
    return Vue.http.put('/shows/recommendation', {
      id: id,
      status: status,
    }).then((response) => {
      if (response.status === 200 && response.data.hasOwnProperty('recommendation')) {
        let recommendation = response.data.recommendation
        Cache.invalidate(this.cacheId)
        return Promise.resolve(recommendation)
      }
    }).catch(() => {
      return Promise.reject(new Error('Impossible de modifier la recommendation'))
    })
  },
  /**
   * Delete a recommendation
   * @param {Integer} id
   * @return {Promise}
   */
  delete (id) {
    return Vue.http.delete('/shows/recommendation', {
      params: {
        id: id,
      },
    }).then((response) => {
      if (response.status === 200 && response.data.hasOwnProperty('recommendation')) {
        let recommendation = response.data.recommendation
        Cache.invalidate(this.cacheId)
        return Promise.resolve(recommendation)
      }
    })
  },
}
