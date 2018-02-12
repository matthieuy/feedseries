import Vue from 'vue'
import axios from 'axios'

import localStore from '../store/local'

/*******************
 * Configure $http *
 *******************/
const baseURL = 'https://api.betaseries.com'
Vue.http = Vue.prototype.$http = axios
Vue.http.defaults.baseURL = baseURL
Vue.http.defaults.headers.common['X-BetaSeries-Version'] = '3.0'
Vue.http.defaults.headers.common['X-BetaSeries-Key'] = '812e07fb3db5'
Vue.http.defaults.isWithToken = true // Add token to request
Vue.http.defaults.isWithBearer = false // Add Bearer Authorization

/***********************
 * Interceptor request *
 ***********************/
Vue.http.interceptors.request.use((config) => {
  console.debug('[API Request] ' + config.method.toUpperCase() + ' ' + config.url.replace(config.baseURL, ''))
  if (localStore.has(localStore.key.TOKEN)) {
    if (config.isWithToken) {
      config.headers.common['X-BetaSeries-Token'] = localStore.get(localStore.key.TOKEN)
    }
    if (config.isWithBearer) {
      config.headers.common['Authorization'] = 'Bearer ' + localStore.get(localStore.key.TOKEN)
    }
  }

  return config
}, (error) => {
  console.error('[API Request] Error', error)
  return Promise.reject(error)
})

/************************
 * Interceptor response *
 ************************/
Vue.http.interceptors.response.use((response) => {
  console.debug('[API Response]', response.config.url.replace(response.config.baseURL, ''), response.data)
  return response
}, (error) => {
  console.error('[API Error]', error.response, error)
  return Promise.reject(error.response)
})
