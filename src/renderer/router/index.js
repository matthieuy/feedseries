import Vue from 'vue'
import Router from 'vue-router'

import localStore from '../store/local'

Vue.use(Router)

const router = new Router({
  routes: [
    // Homepage
    {
      path: '/',
      name: 'homepage',
      component: require('@/components/Homepage').default,
    },
    // Episodes
    {
      path: '/episodes',
      name: 'episodes',
      component: require('@/components/Episodes').default,
    },
    // Calendar
    {
      path: '/calendar',
      name: 'calendar',
      component: require('@/components/Calendar').default,
    },
    // Shows
    {
      path: '/shows',
      name: 'shows',
      component: require('@/components/Shows').default,
    },
    // Show details
    {
      path: '/show/:id',
      component: require('@/components/ShowDetails').default,
      children: [
        // Summary show
        {
          path: '',
          name: 'show',
          component: require('@/components/show/Summary').default,
        },
        // Characters show
        {
          path: 'characters',
          name: 'show.characters',
          component: require('@/components/show/Characters').default,
        },
        // Similars
        {
          path: 'similars',
          name: 'show.similars',
          component: require('@/components/show/Similars').default,
        },
        // Comments
        {
          path: 'comments',
          name: 'show.comments',
          component: require('@/components/show/Comments').default,
        },
        // Suggest
        {
          path: 'suggest',
          name: 'show.suggest',
          component: require('@/components/show/Suggest').default,
        },
        // Show timeline
        {
          path: 'timeline',
          name: 'show.timeline',
          component: require('@/components/show/TimelineShow').default,
        },
      ],
    },
    // Timeline
    {
      path: '/timeline',
      name: 'timeline',
      component: require('@/components/Timeline').default,
    },
    // Search
    {
      path: '/search',
      name: 'search',
      component: require('@/components/Search').default,
    },
    // Recommendations
    {
      path: '/recommendations',
      name: 'recommendations',
      component: require('@/components/Recommendations').default,
    },
    // Statistics
    {
      path: '/stats',
      name: 'statistics',
      component: require('@/components/Statistics').default,
    },
    // Options
    {
      name: 'options',
      path: '/options',
      component: require('@/components/Options').default,
    },
    // Default route
    {
      path: '*',
      redirect: '/',
    },
  ],
})

// Interceptor : save the last route
let routesExcludesSave = ['options']
router.afterEach((to, from) => {
  let save = (localStore.get(localStore.key.ROUTE.SAVE, false) && (routesExcludesSave.indexOf(to.name) < 0))
  if (save && from.path !== to.path) {
    localStore.set(localStore.key.ROUTE.LAST, to.path)
  }
  console.info(`[ROUTE] Change "${from.path}" => "${to.path}" (save: ${save})`)
})

export default router
