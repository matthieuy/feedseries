import Vue from 'vue'
import { localStore } from '../../store'

export default {
  /**
   * Get show comment
   * @param {Show} show
   * @param {Comment|null} last The last comment (for load other)
   * @return {Promise}
   */
  getShow (show, last) {
    let params = {
      type: 'show',
      id: show._id,
      nbpp: localStore.get(localStore.key.COMMENTS.NB, 30),
      order: localStore.get(localStore.key.COMMENTS.ORDER, 'desc'),
    }
    if (typeof last !== 'undefined' && last) {
      params.since_id = last.id
    }

    return this.request(params)
  },

  /**
   * Do request
   * @param {Object} params
   * @private
   * @return {Promise}
   */
  request (params) {
    return Vue.http.get('/comments/comments', {
      params: params,
    }).then((response) => {
      let comments = response.data.comments
      return Promise.resolve(comments)
    })
  },
}
