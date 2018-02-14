import Vue from 'vue'
import { Cache } from '../../db'

export default {
  /**
   * Get last news
   * @param {Integer} number Number of news
   * @return {Promise}
   */
  getNews (number) {
    if (typeof number === 'undefined') {
      number = 10
    }
    // Get from cache
    let cacheId = 'news'
    if (Cache.isValid(cacheId)) {
      let news = Cache.get(cacheId)
      console.log('[API Cache] News::getNews', news)
      return Promise.resolve(news)
    }

    console.log('[API] News::getNews')
    return Vue.http.get('/news/last', {
      params: {
        number: number,
        tailored: 1,
      },
    }).then((response) => {
      if (response.status === 200 && response.data.hasOwnProperty('news')) {
        let news = response.data.news
        news.sort((a, b) => {
          return new Date(b.date) - new Date(a.date)
        })
        Cache.set(cacheId, news, 120)

        return Promise.resolve(news)
      }
    })
  },
}
