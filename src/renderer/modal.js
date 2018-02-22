import Vue from 'vue'

import Modal from './components/modal/Modal'
import router from './router/modal-router'
import db from './db'

require('./config/vue')

db.init().then(() => {
  new Vue({
    components: { Modal },
    router,
    template: '<Modal/>',
  }).$mount('#app')
})
