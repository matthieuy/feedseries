import Vue from 'vue'

import App from './App'
import router from './router'
import store from './store'
import db from './db'

// Config VueJS
require('./config/vue')

db.init().then(() => {
  // App.vue
  new Vue({
    components: { App },
    router,
    store,
    template: '<App/>',
  }).$mount('#app')
})
