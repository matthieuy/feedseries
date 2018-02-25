/**
 * Local storage
 */
import ElectronStore from 'electron-store'

// List of keys
const key = {
  LOGIN: 'login', // {String} current login
  TOKEN: 'token', // {String} user token
  HOMEPAGE: {
    FAVORITE: 'homepage.favorite', // {Boolean} Display favorites on homepage
    NEWS: 'homepage.news', // {Boolean} Display news on homepage
    NB_NEWS: 'homepage.news_nb', // {Integer} Number of news
  },
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
  UPDATE: {
    PRERELEASE: 'update.alpha', // {Boolean} Can use pre-release update
    NOTE: 'update.note', // {Array} Release notes from autoUpdater
    INTERVAL: 'update.interval', // {Integer} Interval betwean 2 check (in hour)
  },
  DOWNLOAD: {
    DIR: 'dl.dir', // {String} Last download dir
    ASK: 'dl.ask', // {Boolean} Ask where save
  },
  COMMENTS: {
    NB: 'comments.nb', // {Integer} Nb of comment to load
    ORDER: 'comments.order', // {String} (asc|desc) Order of comments
  },
  SYSTRAY: 'systray', // {Boolean} close to systray
  HISTORY: 'history', // {Array} The navigator history
  HISTORY_SIZE: 'sizehistory', // {Integer} The size of the navigator history
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
    homepage: {
      favorite: true,
      news: true,
      news_nb: 10,
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
    update: {
      alpha: false,
    },
    devtools: false,
    history: [],
    sizehistory: 5,
  },
})
store.key = key

/**
 * Purge the store (keep connexion)
 */
store.purge = () => {
  let keepData = [key.LOGIN, key.TOKEN]
  let data = {}
  keepData.forEach((k) => {
    data[k] = store.get(k, null)
  })

  store.clear()

  keepData.forEach((k) => {
    if (data[k] !== null) {
      store.set(k, data[k])
    }
  })
}

export default store
