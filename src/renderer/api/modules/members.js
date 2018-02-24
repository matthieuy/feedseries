import Vue from 'vue'

import { Cache, Show } from '../../db'
import { localStore } from '../../store'

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

        // Options
        if (member.hasOwnProperty('options') && member.options.hasOwnProperty('specials')) {
          localStore.set(localStore.key.EPISODES.SPECIAL, member.options.specials)
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
  /**
   * Set a option
   * @param {string} name (downloaded, global, specials, notation, timelag, friendship)
   * @param {Integer|String} value (1 ou 0, pour friendship : open|requests|friends|nobody, pour episodes_tri : nom, date, vide)
   * @return {ConcurentPromise|*|PromiseLike<T>|Promise<T>}
   */
  setOption (name, value) {
    return Vue.http.post('/members/option', {
      name: name,
      value: value,
    }).then((response) => {
      if (response.status === 200 && response.data.hasOwnProperty('option')) {
        let option = response.data.option
        return Promise.resolve(option.value)
      }
    })
  },
  /**
   * Get the url of avatar user
   * @param {Integer} userId The user ID
   * @param {Integer|null} size The size in px or undefined
   * @return {string} The url
   */
  getAvatarURL (userId, size) {
    let url = Vue.http.defaults.baseURL + '/pictures/members?'
    url += 'v=' + Vue.http.defaults.headers.common['X-BetaSeries-Version']
    url += '&key=' + Vue.http.defaults.headers.common['X-BetaSeries-Key']
    url += '&id=' + userId
    if (typeof size !== 'undefined') {
      url += '&width=' + size + '&height=' + size
    }
    return url
  },
}
