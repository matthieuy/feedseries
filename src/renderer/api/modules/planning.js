import Vue from 'vue'

export default {
  /**
   * Get member planning
   * @param {Moment} start
   * @return {Promise}
   */
  getMember (start) {
    let params = {
      unseen: 1,
      month: start.add(15, 'days').format('YYYY-MM'),
    }
    console.log('[API] Planning::getMember', params)

    return Vue.http.get('/planning/member', {
      params,
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
  getMemberBetween (start, end) {
    let params = {
      type: 'show',
      start: start.format('YYYY-MM-DD'),
      end: end.format('YYYY-MM-DD'),
    }
    console.log('[API] Planning::getMemberBetween', params)

    return Vue.http.get('/planning/calendar', {
      params,
    }).then((response) => {
      let events = []
      if (response.status === 200 && response.data.hasOwnProperty('days')) {
        let month = start.add(15, 'days').format('YYYY-MM')

        response.data.days.forEach((day) => {
          day.events.filter((e) => {
            return !e.payload.seen && e.type === 'episode_release' && (e.payload.episode !== '1' || day.date.indexOf(month) === -1)
          }).forEach((e) => {
            events.push({
              start: day.date,
              title: `${e.payload.show_title} - ${e.payload.code}`,
              episode: e.payload,
            })
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
