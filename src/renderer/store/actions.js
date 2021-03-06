import { shell } from 'electron'

import api from '../api'
import db, { Cache } from '../db'
import localStore from '../store/local'

const types = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  ON_LOGIN: 'on_login',
  OPEN_LINK: 'open_link',
}

const actions = {
  /**
   * Login
   * @param context
   * @param authInfo
   * @return {Promise}
   */
  [types.LOGIN] (context, authInfo) {
    return new Promise((resolve, reject) => {
      api.auth.connect(authInfo.login, authInfo.password).then((response) => {
        context.commit(types.LOGIN, response.token)
        console.info('[LOGIN]')
        resolve(response)
      }).catch((e) => {
        context.commit(types.LOGOUT)
        reject(e)
      })
    })
  },
  /**
   * Logout
   * @param context
   * @return {Promise}
   */
  [types.LOGOUT] (context) {
    return new Promise((resolve, reject) => {
      api.auth.disconnect().then(() => {
        console.info('[LOGOUT]')
        context.commit(types.LOGOUT)

        // Clear DB
        localStore.delete(localStore.key.LOGIN)
        localStore.delete(localStore.key.ID_USER)
        Cache.reset()
        let dbNames = ['shows', 'episodes', 'subtitles']
        dbNames.forEach((dbName) => {
          db.clearDb(dbName)
        })
        resolve()
      }).catch(() => {
        reject(new Error())
      })
    })
  },
  /**
   * Open external link
   * @param context
   * @param obj
   * @return {boolean}
   */
  [types.OPEN_LINK] (context, obj) {
    console.log('[LINK] Open', obj)
    let url = ''
    if (obj.constructor.name === 'Episode' || obj.typeObj === 'Episode' || obj.code) {
      url = `https://www.betaseries.com/episode/${obj.show.slug}/${obj.code.toLowerCase()}`
    } else if (obj.constructor.name === 'Show' || obj.typeObj === 'Show') {
      url = `https://www.betaseries.com/serie/${obj.slug}`
    } else if (typeof obj === 'string' || obj instanceof String) {
      url = obj
    } else {
      return false
    }
    shell.openExternal(url)
  },
}

export { types }
export default actions
