/**
 * Local storage
 */
import ElectronStore from 'electron-store'

// List of keys
const key = {
  LOGIN: 'login', // {String} current login
  TOKEN: 'token', // {String} user token
  EPISODES: {
    FILTER: 'episodes.filter', // {String} Filter (view|get|all)
    LIMIT: 'episodes.limit', // {Integer} Nb of episodes
    ORDER: 'episodes.order', // {String} (alpha|date) Order of episodes
    REVERSE: 'episodes.reverse', // {Boolean} Reverse order
    SPECIAL: 'episodes.special', // {Boolean} Show special episode
    SRT_VF_ONLY: 'vf', // {Boolean} Show only VF subtitle
  },
  TIMELINE: {
    NB: 'timeline.nb', // {Integer} Nb of event per page
    HIMSELF: 'timeline.himself', // {Integer} (0|1) Include himself actions
  },
  SHOWS: {
    ORDER: 'shows.order', // {String} (alphabetical|progression|remaining_time|remaining_episodes) Order of shows
    REVERSE: 'shows.reverse', // {Boolean} Reverse order
  },
  ROUTE: {
    SAVE: 'route.save', // {Boolean} Save the last route
    LAST: 'route.last', // {String} The last route path
  },
  LAST_DL: 'last.dl', // {String} Last download dir
  SYSTRAY: 'systray', // {Boolean} close to systray
  HISTORY: 'history', // {Array} The navigator history
  DEVTOOLS: 'devtools', // {Boolean} Devtools is open
}

let store = new ElectronStore({
  defaults: {
    episodes: {
      filter: 'all',
      limit: 1,
      order: 'date',
      special: true,
      vf: true,
    },
    timeline: {
      nb: 30,
      himself: 0,
    },
    shows: {
      order: 'alphabetical',
    },
    route: {
      save: false,
      last: '/',
    },
    devtools: false,
    history: [],
  },
})
store.key = key

export default store
