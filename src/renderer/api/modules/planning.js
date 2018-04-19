import Vue from 'vue'

export default {
  /**
   * Get member planning
   * @param {Moment} start
   * @return {Promise}
   */
  getMember (start) {
    return Vue.http.get('/planning/member', {
      params: {
        unseen: 1,
        month: start.add(15, 'days').format('YYYY-MM'),
      },
    }).then((response) => {
      let events = []
      if (response.status === 200 && response.data.hasOwnProperty('episodes')) {
        let episodes = response.data.episodes.filter((episode) => episode.episode !== 1)
        episodes.forEach((episode) => {
          events.push({
            start: episode.date,
            title: `${episode.show.title} - ${episode.code}`,
            episode: episode,
          })
        })
      }
      return Promise.resolve(events)
    }).catch(() => {
      return Promise.reject(new Error('Impossible de récupérer le planning'))
    })
  },
  /**
   * Get firsts episodes
   * @param {Moment} day
   * @return {Promise}
   */
  getPremieres (day) {
    return Vue.http.get('/planning/general', {
      params: {
        date: day.format('Y-MM') + '-01',
        before: 0,
        after: day.daysInMonth(),
        type: 'premieres',
      },
    }).then((response) => {
      let events = []
      if (response.status === 200 && response.data.hasOwnProperty('episodes')) {
        let episodes = response.data.episodes.filter((episode) => episode.show.in_account && !episode.user.seen)
        episodes.forEach((episode) => {
          events.push({
            start: episode.date,
            title: `${episode.show.title} - ${episode.code}`,
            episode: episode,
          })
        })
      }
      return Promise.resolve(events)
    }).catch(() => {
      return Promise.reject(new Error('Impossible de récupérer le planning'))
    })
  },
}
