import Vue from 'vue'

import { Subtitle } from '../../db'
import store, { localStore, types } from '../../store'

export default {
  /**
   * Get all subtitle of a show
   * @param show
   * @return {Promise}
   */
  getShow (show) {
    console.info('[API] Subtitles::getShow', show)
    return Vue.http.get('/subtitles/show', {
      params: {
        id: show._id,
      },
    }).then((response) => {
      let subtitles = response.data.subtitles
      let srtVFOnly = localStore.get(localStore.key.EPISODES.SRT_VF_ONLY, true)

      let promiseList = []
      subtitles.forEach((srt) => {
        if ((srtVFOnly && (srt.language === 'VF')) || !srtVFOnly) {
          let p = Subtitle.findOneAndUpdate({_id: srt.id + ''}, Subtitle.cleanProperties(srt), {upsert: true})
          promiseList.push(p)
        }
      })

      return Promise.all(promiseList).then((srt) => {
        store.dispatch(types.subtitles.ACTIONS.LOAD_SUBTITLES)
        return Promise.resolve(srt)
      })
    })
  },
}
