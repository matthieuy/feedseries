import Vue from 'vue'

import Modal from './components/modal/Modal'
import router from './router/modal-router'

require('./config/vue')

new Vue({
  components: { Modal },
  router,
  template: '<Modal/>',
}).$mount('#app')
