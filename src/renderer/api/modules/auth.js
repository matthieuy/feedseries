import Vue from 'vue'
import md5 from 'md5'

import localStore from '../../store/local'

export default {
  /**
   * Check if auth is OK
   * @return Promise (resolve with token)
   */
  isActive () {
    console.info('[API] Auth::isActive')
    let token = localStore.get(localStore.key.TOKEN, false)
    if (!token) {
      return new Promise((resolve, reject) => {
        throw new Error()
      })
    }

    // API Request
    return Vue.http.get('/members/is_active', {
      params: {
        token: token,
      },
    }, {
      isWithBearer: true,
      isWithToken: false,
    })
      .then((response) => {
        if (response.data.errors.length === 0) {
          return Promise.resolve(token)
        } else {
          return Promise.reject(response.data.errors[0])
        }
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  },
  /**
   * Connect the user
   * @param {String} login
   * @param {String} password
   * @return Promise with login & token or error
   */
  connect (login, password) {
    console.info('[API] Auth::connect')
    return Vue.http.post('/members/auth', {
      login: login,
      password: md5(password),
    }, {
      isWithBearer: true,
      validateStatus (status) {
        return status === 200 || status === 400 // Accept error 400 (wrong auth)
      },
    }).then((response) => {
      if (response.status === 200 && response.data.token.length) {
        return Promise.resolve({
          login: response.data.user.login,
          token: response.data.token,
        })
      } else {
        return Promise.reject(response.data.errors[0])
      }
    })
  },
  /**
   * Disconnect the user
   * @return Promise
   */
  disconnect () {
    console.info('[API] Auth::disconnect')
    let token = localStore.get(localStore.key.TOKEN, false)
    if (!token) {
      return new Promise((resolve, reject) => {
        resolve()
      })
    }
    return Vue.http.post('/members/destroy', {
      token: token,
    })
  },
  /**
   * Get password by email
   * @param {String} email login or email
   */
  lost (email) {
    return Vue.http.post('/members/lost', {
      find: email,
    }, {
      isWithBearer: true,
      isWithToken: false,
    }).then((response) => {
      if (response.status === 200 && response.data.email) {
        return Promise.resolve()
      }
    }).catch((error) => {
      return Promise.reject(error.data.errors[0].text)
    })
  },
}
