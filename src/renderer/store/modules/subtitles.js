import fs from 'fs'
import path from 'path'
import request from 'request'
import { remote } from 'electron'

import localStore from '../local'
import { Subtitle } from '../../db'

const types = {
  MUTATIONS: {
    SET_SUBTITLES: 'subtitles.setAll',
    RESET: 'subtitles.reset',
  },
  ACTIONS: {
    LOAD_SUBTITLES: 'subtitles.load',
    DL_SUBTITLE: 'subtitles.dl',
  },
  GETTERS: {
    SUBTITLES: 'subtitles.get',
  },
}

const state = {
  EpisodeSubtitles: {},
  SeasonSubtitles: {},
}

const mutations = {
  [types.MUTATIONS.SET_SUBTITLES] (state, subtitles) {
    subtitles.forEach((subtitle) => {
      if (subtitle.episode) {
        let key = `${subtitle.showId}_${subtitle.season}_${subtitle.episode}`
        if (!state.EpisodeSubtitles.hasOwnProperty(key)) {
          state.EpisodeSubtitles[key] = []
        }
        state.EpisodeSubtitles[key].push(subtitle)
      } else {
        let key = subtitle.showId + '_' + subtitle.season
        if (!state.SeasonSubtitles.hasOwnProperty(key)) {
          state.SeasonSubtitles[key] = []
        }
        state.SeasonSubtitles[key].push(subtitle)
      }
    })
  },
  [types.MUTATIONS.RESET] (state) {
    state.EpisodeSubtitles = {}
    state.SeasonSubtitles = {}
  },
}

const actions = {
  [types.ACTIONS.LOAD_SUBTITLES] (context) {
    return Subtitle.find({}).then((subtitles) => {
      context.commit(types.MUTATIONS.RESET)
      context.commit(types.MUTATIONS.SET_SUBTITLES, subtitles)
    })
  },
  [types.ACTIONS.DL_SUBTITLE] (context, subtitle) {
    let dirPath = localStore.get(localStore.key.LAST_DL, remote.app.getPath('downloads'))
    remote.dialog.showSaveDialog(remote.getCurrentWindow(), {
      title: 'Sauvegarder un fichier de sous-titre',
      defaultPath: path.join(dirPath, subtitle.name),
    }, (filepath) => {
      if (typeof filepath !== 'undefined') {
        // Save download path
        dirPath = path.dirname(filepath)
        localStore.set(localStore.key.LAST_DL, dirPath)

        // Download
        let req = request({
          method: 'GET',
          uri: `https://www.betaseries.com/srt/${subtitle._id}`,
        })
        let out = fs.createWriteStream(filepath)
        req.pipe(out)

        req.on('end', () => {
          /* eslint-disable no-new */
          new Notification('Sous-titre téléchargé', {
            body: filepath,
          })
        })
      }
    })
  },
}

const getters = {
  [types.GETTERS.SUBTITLES]: (state) => (episode) => {
    let listSeason = state.SeasonSubtitles[episode.show._id + '_' + episode.season] || []
    let listEpisode = state.EpisodeSubtitles[episode.show._id + '_' + episode.season + '_' + episode.episode] || []

    let listSubtitles = [].concat(listSeason, listEpisode)
    listSubtitles.sort((a, b) => {
      let number = a.episode - b.episode
      if (number !== 0) {
        return number
      }
      return a.name.localeCompare(b.name)
    })

    return listSubtitles
  },
}

export { types }
export default {
  state,
  mutations,
  actions,
  getters,
  strict: process.env.NODE_ENV !== 'production',
}
