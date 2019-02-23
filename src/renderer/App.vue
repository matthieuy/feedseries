<template>
  <div id="app">
    <div class="window">
      <header class="toolbar toolbar-header">
        <div class="toolbar-actions">
          <div class="btn-group">
            <router-link :to="{name: 'homepage'}" class="btn btn-default" :class="{active: $route.name === 'homepage'}">
              <i class="fa fa-home"></i>
            </router-link>
            <router-link :to="{name: 'episodes'}" class="btn btn-default" :class="{active: $route.name === 'episodes'}">
              <i class="fa fa-tasks"></i>
            </router-link>
            <router-link :to="{name: 'shows'}" class="btn btn-default" :class="{active: $route.name === 'shows'}">
              <i class="fa fa-list"></i>
            </router-link>
            <router-link :to="{name: 'calendar'}" class="btn btn-default" :class="{active: $route.name === 'calendar'}">
              <i class="fa fa-calendar-alt"></i>
            </router-link>
            <router-link :to="{name: 'timeline'}" class="btn btn-default" :class="{active: $route.name === 'timeline'}">
              <i class="fa fa-users"></i>
            </router-link>
          </div>

          <div class="btn-group" style="z-index: 250;">
            <button class="btn btn-default btn-dropdown dropdown" :class="{disabled: !history.length}">
              <div class="dropdown-content" v-if="history.length">
                <router-link :to="link.path" class="dropdown-item" v-for="link in history" :key="link.path">{{ link.label }}</router-link>
                <div class="dropdown-divider" v-if="history.length"></div>
                <div class="dropdown-item" v-if="history.length" @click="clearHistory()">
                  <i class="fa fa-trash"></i>
                  Vider l'historique
                </div>
              </div>
              <i class="fa fa-history"></i>
            </button>
          </div>

          <div class="btn-group">
            <router-link :to="{name: 'search'}" class="btn btn-default" :class="{active: $route.name === 'search'}">
              <i class="fa fa-search"></i>
            </router-link>
            <router-link :to="{name: 'recommendations'}" class="btn btn-default" :class="{active: $route.name === 'recommendations'}">
              <i class="fa fa-thumbs-up" :class="{red: nbRecommendations > 0}"></i>
            </router-link>
            <router-link :to="{name: 'statistics'}" class="btn btn-default" :class="{active: $route.name === 'statistics'}">
              <i class="fa fa-chart-line"></i>
            </router-link>
          </div>

          <div class="btn-group pull-right">
            <router-link :to="{name: 'options'}" class="btn btn-default" :class="{active: $route.name === 'options'}">
              <i class="fa fa-cog"></i>
            </router-link>
            <button class="btn btn-default" @click="devTools()" :class="{active: devToolsOpen}" v-if="isDev">
              <i class="fa fa-bug"></i>
            </button>
            <button class="btn btn-default" @click="disconnect()">
              <i class="fa" :class="[isDisconnecting ? 'fa-spinner fa-spin' : 'fa-power-off']"></i>
            </button>
          </div>
        </div>
      </header>

      <div class="window-content">
        <router-view>&nbsp;</router-view>
      </div>
    </div>

    <login-modal>&nbsp;</login-modal>
    <drop-zone>&nbsp;</drop-zone>
  </div>
</template>

<script>
  import { ipcRenderer, remote } from 'electron'
  import { mapState, mapGetters } from 'vuex'

  import LoginModal from './components/LoginModal'
  import DropZone from './components/DropZone'
  import api from './api'
  import { types, localStore } from './store'

  export default {
    components: {
      LoginModal,
      DropZone,
    },
    data () {
      return {
        isDisconnecting: false,
        devToolsOpen: false,
        isDev: false,
        recommendationNotif: 0,
      }
    },
    computed: {
      ...mapState({
        history: 'history',
        finishShow: state => state.episodes.finishShow,
      }),
      ...mapGetters({
        nbRecommendations: types.recommendations.GETTERS.NB_WAIT,
      }),
    },
    methods: {
      // Disconnect the user
      disconnect () {
        this.isDisconnecting = true
        this.$store.dispatch(types.ACTIONS.LOGOUT).then(() => {
          this.isDisconnecting = false
        })
      },
      // Toggle devtools
      devTools () {
        let currentWindow = remote.getCurrentWindow()
        this.devToolsOpen = !currentWindow.isDevToolsOpened()
        remote.getCurrentWindow().toggleDevTools()
      },
      // Clear the history
      clearHistory () {
        this.$store.commit(types.MUTATIONS.SET_HISTORY, [])
        localStore.set(localStore.key.HISTORY, [])
      },
    },
    watch: {
      nbRecommendations (nbRecommendations) {
        console.log('New recommandations : ', nbRecommendations)
        if (nbRecommendations) {
          console.log('notif')
          // if (this.recommendationNotif !== nbRecommendations && nbRecommendations > 0 && this.$route.name !== 'recommendations') {
          let notif = new window.Notification(remote.app.getName(), {
            body: `Vous avez ${nbRecommendations} recommandation(s) en attente`,
            icon: localStore.getIconPath(true, true),
          })
          notif.onclick = () => {
            this.$router.push({ name: 'recommendations' })
          }
        }
        this.recommendationNotif = nbRecommendations
      },
      /**
       * When a show is done
       * @param {Show} show
       * @returns {boolean}
       */
      finishShow (show) {
        if (!show) {
          return false
        }

        // Confirm archive
        let txt = (show.status === 'Ended') ? `C'était le dernier épisode de la saison de "${show.title}" !` : `C'était l'épisode final de "${show.title}" !`
        remote.dialog.showMessageBox(remote.getCurrentWindow(), {
          title: 'Archiver une série',
          icon: localStore.getIconPath(),
          buttons: ['Oui', 'Non'],
          defaultId: 0,
          message: txt + `\nVoulez-vous archiver la série maintenant ?`,
          type: 'question',
          cancelId: 1,
        }, (response) => {
          if (response === 0) {
            this.$store.dispatch(types.shows.ACTIONS.ARCHIVE, show)
          }
          this.$store.commit(types.episodes.MUTATIONS.SET_FINISH_SHOW, false)
        })
      },
    },
    mounted () {
      console.info('[VUE] Mount App.vue')

      // Dev tools
      if (process.env.NODE_ENV === 'development') {
        this.isDev = true
        this.devToolsOpen = remote.getCurrentWindow().isDevToolsOpened()
        remote.getCurrentWebContents().on('devtools-opened', () => { this.devToolsOpen = true })
        remote.getCurrentWebContents().on('devtools-closed', () => { this.devToolsOpen = false })
      }

      // History
      this.$store.commit(types.MUTATIONS.SET_HISTORY, localStore.get(localStore.key.HISTORY, []))

      // Disable drag
      window.ondragstart = () => { return false }

      // Check auth
      api.auth.isActive().then((token) => {
        // OK => Save login and dispatch actions
        this.$store.commit(types.MUTATIONS.LOGIN, token)
        this.$store.dispatch(types.ACTIONS.ON_LOGIN).then(() => {
          console.info('[SplashScreen] Hide')
          ipcRenderer.send('app-ready')
        })

        // Recommendations
        this.$store.dispatch(types.recommendations.ACTIONS.INTERVAL_RECOMMENDATION)
      }).catch(() => {
        this.$store.commit(types.MUTATIONS.LOGOUT)
        ipcRenderer.send('app-ready')
      })
    },
  }
</script>

<style lang="scss">
  @import "assets/scss/theme";
  .fa.red, .active .fa.red {
    animation: recommendation-animation 1s steps(2) infinite;
  }
  @keyframes recommendation-animation {
    0% { color: #b4171f; }
    100% { color: initial; }
  }
</style>
