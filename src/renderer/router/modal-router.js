import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const router = new Router({
  routes: [
    // Options
    {
      name: 'options',
      path: '/options',
      component: require('@/components/modal/Options').default,
    },
    // About modal
    {
      name: 'about',
      path: '/about',
      component: require('@/components/modal/About').default,
    },
    {
      path: '*',
      redirect: '/about',
    },
  ],
})

export default router
