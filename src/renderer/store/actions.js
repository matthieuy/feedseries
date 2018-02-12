import { shell } from 'electron'

import api from '../api'
import localStore from '../store/local'

const types = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  ON_LOGIN: 'on_login',
  OPEN_LINK: 'open_link',
}

const actions = {
  // Login
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
  // Logout
  [types.LOGOUT] (context) {
    return new Promise((resolve, reject) => {
      api.auth.disconnect().then(() => {
        context.commit(types.LOGOUT)
        localStore.delete(localStore.key.LOGIN)
        console.info('[LOGOUT]')
        resolve()
      }).catch(() => {
        reject(new Error())
      })
    })
  },
  // Open external link
  [types.OPEN_LINK] (context, obj) {
    let url = ''
    if (obj.constructor.name === 'Episode' || obj.typeObj === 'Episode') {
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
