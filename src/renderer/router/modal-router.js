import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const router = new Router({
  routes: [
    // About modal
    {
      name: 'about',
      path: '/about',
      component: require('@/components/modal/About').default,
    },
    // Links manager
    {
      name: 'links',
      path: '/show/:id/links',
      component: require('@/components/modal/Links').default,
    },
    // Update
    {
      name: 'update',
      path: '/update',
      component: require('@/components/modal/Update').default,
    },
    {
      path: '*',
      redirect: '/about',
    },
  ],
})

export default router
