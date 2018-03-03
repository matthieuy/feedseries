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
      console.log('[API Cache] Recommendations:getList', list)
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
}
