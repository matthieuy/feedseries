import Vue from 'vue'

import { Cache } from '../../db'

export default {
  cacheId: 'friends',
  cacheTtl: 3600 * 24,

  /**
   * Get friends list
   * @return {Promise}
   */
  getList () {
    if (Cache.isValid(this.cacheId)) {
      let list = Cache.get(this.cacheId)
      console.info('[API Cache] Friends:getList', list)
      return Promise.resolve(list)
    }

    console.info('[API] Firedns:getList')
    return Vue.http.get('/friends/list').then((response) => {
      if (response.status === 200 && response.data.hasOwnProperty('users')) {
        let friends = response.data.users
        Cache.set(this.cacheId, friends, this.cacheTtl)

        return Promise.resolve(friends)
      }
    })
  },
}
