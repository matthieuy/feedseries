import Vue from 'vue'

import { Cache, Show } from '../../db'

export default {
  /**
   * Get member summary + refresh show list in DB
   * @param summary {Boolean} Get only summary informations without shows
   * @returns {Promise}
   */
  getInfos (summary) {
    let params = (summary === true) ? {summary: true} : {only: 'shows'}

    // Get from cache
    let cacheId = 'summary'
    if (summary === true && Cache.isValid(cacheId)) {
      let infos = Cache.get(cacheId)
      console.info('[API Cache] Members::getInfos', infos)
      return Promise.resolve(infos)
    }

    // API Request
    console.info('[API] Members::getInfos')
    return Vue.http.get('/members/infos', {
      params,
    }).then((response) => {
      if (response.status === 200 && response.data.hasOwnProperty('member')) {
        let member = response.data.member

        // Save shows in DB
        if (member.hasOwnProperty('shows') && member.shows.length) {
          member.shows.forEach(async (show) => {
            await Show.findOneAndUpdate({_id: show.id + ''}, Show.cleanProperties(show), {upsert: true})
          })
          console.info(`[DB] Update ${member.shows.length} shows`)
          delete member.shows
        }

        // Clear data (favorites,...) we can have from DB
        delete member.favorites
        delete member.favorite_movies

        // Cache members informations
        Cache.set(cacheId, member, 30)

        return Promise.resolve(member)
      }
    })
  },
}
