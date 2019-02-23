<template>
  <div id="options">
    <div class="tab-group">
      <div class="tab-item" :class="{active: activeTab === 'display' }" @click="activeTab = 'display'">Affichage</div>
      <div class="tab-item" :class="{active: activeTab === 'system' }" @click="activeTab = 'system'">Système</div>
      <div class="tab-item" :class="{active: activeTab === 'cache' }" @click="activeTab = 'cache'">Cache</div>
    </div>

    <!-- Display -->
    <div v-show="activeTab === 'display'" class="tab-content">
      <fieldset class="field-col">
        <legend>Accueil</legend>
        <div class="checkbox">
          <label><input type="checkbox" v-model="homepageFavorite" /> Afficher les favoris sur la page d'accueil</label>
        </div>
        <div class="checkbox">
          <label><input type="checkbox" v-model="homepageNews" /> Afficher les news sur la page d'accueil</label>
        </div>
        <div class="form-group">
          <label>
            Nombre de news à afficher :
            <input type="number" v-model="nbNews" max="20" min="2" :class="{disabled: !homepageNews }" :disabled="!homepageNews"/>
          </label>
        </div>
        <div class="checkbox">
          <label><input type="checkbox" v-model="graphFinish" /> Afficher les séries terminées dans le graph</label>
        </div>
      </fieldset>

      <fieldset class="field-col">
        <legend>Timeline et commentaires</legend>
        <div class="form-group">
          <label>
            Nombre d'évènements à afficher dans la timeline par page :
            <input type="number" v-model="timeline" max="50" min="5"/>
          </label>
        </div>
        <div class="checkbox">
          <label><input type="checkbox" v-model="timelineHimself" /> Inclure vos actions dans la timeline</label>
        </div>
        <div class="form-group">
          <label>
            Nombre de commentaires par page :
            <input type="number" v-model="commentsNb" max="50" min="5" />
          </label>
        </div>
        <div class="form-group">
          <label>
            Ordre d'affichage des commentaires :
            <select v-model="commentsOrder">
              <option value="asc">Croissant</option>
              <option value="desc">Décroissant</option>
            </select>
          </label>
        </div>
      </fieldset>

      <div class="clearfix"></div>

      <fieldset>
        <legend>Divers</legend>
        <div class="checkbox">
          <label><input type="checkbox" v-model="whiteicon" /> Utiliser un icône clair</label>
        </div>
        <div class="checkbox">
          <label><input type="checkbox" v-model="hideMenu" /> Cacher la barre de menu (affichable avec la touche "Alt") </label>
        </div>
        <div class="checkbox">
          <label><input type="checkbox" v-model="special" /> Afficher les épisodes spéciaux</label>
        </div>
        <div class="checkbox">
          <label><input type="checkbox" v-model="calendarSave"/> Retenir le dernier mois affiché dans le planning</label>
        </div>
        <div class="checkbox">
          <label><input type="checkbox" v-model="srtVF" /> Afficher uniquement les sous-titres français</label>
        </div>
      </fieldset>
    </div>

    <!-- System -->
    <div v-show="activeTab === 'system'" class="tab-content">
      <fieldset class="field-col">
        <legend>Démarrage et fermeture</legend>
        <div class="checkbox">
          <label><input type="checkbox" v-model="autoload" /> Lancer FeedSeries au démarrage du système</label>
        </div>
        <div class="checkbox">
          <label><input type="checkbox" v-model="saveRoute" /> Afficher la dernière page visitée à l'ouverture de FeedSeries</label>
        </div>
        <div class="checkbox">
          <label><input type="checkbox" v-model="systray"/> Réduire dans le systray à la fermeture de la fenêtre</label>
        </div>
      </fieldset>

      <fieldset class="field-col">
        <legend>Téléchargement</legend>
        <div class="form-group">
          Dossier de téléchargement : <span class="dl-dir" @click="changeDlDir()">{{ dlDir }}</span>
        </div>
        <div class="checkbox">
          <label><input type="checkbox" v-model="dlAsk" /> Choisir le dossier de destination avant le téléchargement</label>
        </div>
      </fieldset>

      <div class="clearfix"></div>

      <fieldset>
        <legend>Mise à jour</legend>
        <div class="checkbox">
          <label :class="{strikealpha: !updateAlpha}"><input type="checkbox" v-model="updateAlpha" readonly disabled />Récupérer les mises à jour intermédiaires</label>
        </div>
        <div class="form-group">
          <label>
            Vérifier la présence de mise à jour :
            <select v-model="updateInterval">
              <option value="1">1 heure</option>
              <option value="6">6 heures</option>
              <option value="12">12 heures</option>
              <option value="24">24 heures</option>
              <option value="168">7 jours</option>
              <option value="0">jamais</option>
            </select>
          </label>
        </div>
        <button class="btn btn-nav" @click="checkUpdate">Vérifier maintenant</button>
      </fieldset>

      <fieldset>
        <legend>Divers</legend>

        <div class="form-group">
          <label>
            Taille de l'historique de navigation :
            <input type="number" v-model="sizeHistory" max="15" min="0" />
          </label>
        </div>
        <div class="form-group">
          <label>
            Intervalle entre 2 vérifications de nouvelles recommandations :
            <select v-model="recommendationInterval">
              <option value="0.083" v-if="env === 'development'">5 minutes</option>
              <option value="0.5">30 minutes</option>
              <option value="1">1 heure</option>
              <option value="2">2 heures</option>
              <option value="6">6 heures</option>
              <option value="12">12 heures</option>
              <option value="24">24 heures</option>
              <option value="168">7 jours</option>
              <option value="0">jamais</option>
            </select>
          </label>
        </div>
        <div class="form-group">
          <label>
            Nombre de jour avant de considérer une série comme terminée :
            <input type="number" v-model="beforeArchive" max="45" min="8" />
          </label>
        </div>
      </fieldset>

      <div class="text-center">
        <button class="btn btn-nav" @click="purge()"><i class="fa fa-trash"></i> Réinitialiser la configuration</button>
      </div>
    </div>

    <!-- Cache -->
    <div v-show="activeTab === 'cache'" class="tab-content">
      <div class="text-center">
        <button class="btn btn-nav" @click="openConf()" v-if="env === 'development'"><i class="fa fa-pencil-alt"></i>Éditer le fichier de configuration</button>
      </div>

      <div class="block-btns">
        <div class="block-btn">
          <div class="title">Cache local ({{ fileSize.cache | size }})</div>
          <p>
            Il contient les requêtes distantes pour accélérer l'affichage.
            Vous pouvez le vider en cas de problème de synchro avec BetaSeries.
          </p>
          <div class="btns">
            <button class="btn btn-nav" @click="clearCache()" v-show="fileSize.cache">Vider</button>
          </div>
        </div>

        <div class="block-btn">
          <div class="title">Cache système <span v-show="fileSize.data">({{ fileSize.data | size }})</span></div>
          <p>
            Il contient principalement les images téléchargés puis affichées dans FeedSeries.<br>
            Un redémarrage de FeedSeries est nécessaire pour compléter le nettoyage.
          </p>
          <div class="btns">
            <button class="btn btn-nav" @click="rmCacheData()">
              Purger
            </button>
          </div>
        </div>

        <div class="block-btn">
          <div class="title">Bases de données</div>
          <p>
            Les BDD contiennent les différents éléments (séries, épisodes,...) pour conserver une synchronisation avec BetaSeries.
          </p>
          <div class="btns">
            <button class="btn btn-nav" v-show="fileSize.shows" @click="clearDb('shows')">
              Séries ({{ fileSize.shows | size }})
            </button>
            <button class="btn btn-nav" v-show="fileSize.episodes" @click="clearDb('episodes')">
              Épisodes ({{ fileSize.episodes | size }})
            </button>
            <button class="btn btn-nav" v-show="fileSize.subtitles" @click="clearDb('subtitles')">
              Sous-titres ({{ fileSize.subtitles | size }})
            </button>
            <button class="btn btn-nav" v-show="fileSize.links" @click="clearDb('links')">
              Liens perso ({{ fileSize.links | size }})
            </button>
            <button class="btn btn-nav" v-show="fileSize.stats" @click="clearDb('stats')">
              Statistiques ({{ fileSize.stats | size }})
            </button>

          </div>
        </div>
      </div>
    </div>
    <div class="clearfix"></div>
  </div>
</template>

<script>
  import { ipcRenderer, remote } from 'electron'
  import Autolauch from 'auto-launch'
  import api from '../api'
  import db, { Cache } from '../db'
  import { localStore, types } from '../store'

  let launcher = new Autolauch({
    name: remote.app.getName(),
    isHidden: true,
  })

  export default {
    data () {
      return {
        activeTab: 'display',
        env: process.env.NODE_ENV,
        fileSize: {},
        needRestart: false,
        // Display
        hideMenu: true,
        saveRoute: false,
        sizeHistory: 5,
        homepageFavorite: true,
        graphFinish: false,
        homepageNews: true,
        nbNews: 10,
        special: false,
        calendarSave: false,
        timeline: 30,
        timelineHimself: false,
        commentsNb: 30,
        commentsOrder: 'desc',
        srtVF: true,
        recommendationInterval: 2,
        // System
        systray: true,
        whiteicon: false,
        autoload: false,
        dlDir: '',
        dlAsk: true,
        updateInterval: 1,
        updateAlpha: false,
        beforeArchive: 16,
      }
    },
    methods: {
      /**
       * Load the configuration from localStore
       */
      load () {
        // Display
        this.hideMenu = localStore.get(localStore.key.HIDE_MENU, true)
        this.saveRoute = localStore.get(localStore.key.ROUTE.SAVE, false)
        this.sizeHistory = localStore.get(localStore.key.HISTORY_SIZE, 5)
        this.homepageFavorite = localStore.get(localStore.key.HOMEPAGE.FAVORITE, true)
        this.graphFinish = localStore.get(localStore.key.HOMEPAGE.GRAPH_FINISH, false)
        this.homepageNews = localStore.get(localStore.key.HOMEPAGE.NEWS, true)
        this.nbNews = localStore.get(localStore.key.HOMEPAGE.NB_NEWS, 10)
        this.special = localStore.get(localStore.key.EPISODES.SPECIAL, false)
        this.calendarSave = localStore.get(localStore.key.CALENDAR.SAVE_DATE, false)
        this.timeline = localStore.get(localStore.key.TIMELINE.NB, 30)
        this.timelineHimself = localStore.get(localStore.key.TIMELINE.HIMSELF, false)
        this.commentsNb = localStore.get(localStore.key.COMMENTS.NB, 30)
        this.commentsOrder = localStore.get(localStore.key.COMMENTS.ORDER, 'desc')
        this.srtVF = localStore.get(localStore.key.EPISODES.SRT_VF_ONLY, true)
        this.recommendationInterval = localStore.get(localStore.key.RECOMMENDATIONS.INTERVAL, 2)

        // System
        this.systray = localStore.get(localStore.key.SYSTRAY, true)
        this.whiteicon = localStore.get(localStore.key.WHITE_ICON, false)
        this.dlDir = localStore.get(localStore.key.DOWNLOAD.DIR, remote.app.getPath('downloads'))
        this.dlAsk = localStore.get(localStore.key.DOWNLOAD.ASK, true)
        this.updateInterval = localStore.get(localStore.key.UPDATE.INTERVAL, 1)
        this.updateAlpha = localStore.get(localStore.key.UPDATE.PRERELEASE, false)
        this.beforeArchive = localStore.get(localStore.key.EPISODES.DAY_BEFORE_ARCHIVE, 16)
        launcher.isEnabled().then((enabled) => {
          this.autoload = enabled
        })
      },
      /**
       * Change download directory
       */
      changeDlDir () {
        remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
          title: 'Dossier de téléchargement',
          defaultPath: this.dlDir,
          properties: ['openDirectory', 'createDirectory'],
        }, (dirpath) => {
          if (typeof dirpath !== 'undefined') {
            this.dlDir = dirpath[0]
            localStore.set(localStore.key.DOWNLOAD.DIR, this.dlDir)
          }
        })
      },
      /**
       * Open config in editor
       */
      openConf () {
        localStore.openInEditor()
      },
      /**
       * Refresh (async) the cache data size
       */
      refreshDataCacheSize () {
        Cache.getCacheDataSize().then((size) => {
          this.$set(this.fileSize, 'data', size)
        })
      },
      /**
       * Purge localStore (without logout)
       */
      purge () {
        localStore.purge()
        this.load()
      },
      /**
       * Clear a DB
       * @param {String} name The DB name
       */
      clearDb (name) {
        remote.dialog.showMessageBox(remote.getCurrentWindow(), {
          type: 'warning',
          buttons: ['Oui', 'Non'],
          defaultId: 1,
          title: remote.app.getName(),
          icon: localStore.getIconPath(),
          message: `Êtes-vous sûr de vouloir purger la base de donnée "${name}" ?`,
          cancelId: 1,
        }, (btnId) => {
          if (btnId === 0) {
            db.clearDb(name).then(() => {
              console.log(`[DB] Delete "${name}.db"`)
              this.addNotification(`Purge de la base de donnée "${name}"`)
              this.fileSize[name] = db.getSize(name)
            })
          }
        })
      },
      checkUpdate () {
        ipcRenderer.send('check-update', true)
      },
      /**
       * Clear the local cache
       */
      clearCache () {
        Cache.reset()
        this.fileSize.cache = Cache.getSize()
      },
      /**
       * Delete all files in Cache data
       */
      rmCacheData () {
        Cache.rmCacheData().then(() => {
          this.refreshDataCacheSize()
          this.addNotification(`Fichiers du cache supprimés :\n${Cache.getCacheDataDir()}`)
          this.needRestart = true
        }).catch((err) => {
          console.log('Error clear data cache', err)
          this.addNotification(`Erreur lors de la suppression du dossier de cache :\n${Cache.getCacheDataDir()}`)
        })
      },
      /**
       * Add a notification
       * @param text
       */
      addNotification (text) {
        /* eslint-disable no-new */
        new window.Notification(remote.app.getName(), {
          body: text,
          icon: localStore.getIconPath(true, true),
        })
      },
    },
    watch: {
      systray (value) {
        if (this.systray !== value) {
          localStore.set(localStore.key.SYSTRAY, value)
        }
      },
      whiteicon (value) {
        if (value !== localStore.get(localStore.key.WHITE_ICON, true)) {
          localStore.set(localStore.key.WHITE_ICON, value)
          ipcRenderer.send('update-icon')
          console.log('Changement d\'icone', localStore.getIconPath())
        }
      },
      autoload (value) {
        launcher.isEnabled().then((enabled) => {
          if (value !== enabled) {
            if (value) {
              launcher.enable()
            } else {
              launcher.disable()
            }
          }
        })
      },
      hideMenu (value) {
        if (value !== localStore.get(localStore.key.HIDE_MENU, true)) {
          let win = remote.getCurrentWindow()
          win.setAutoHideMenuBar(value)
          win.setMenuBarVisibility(!value)
          localStore.set(localStore.key.HIDE_MENU, value)
        }
      },
      saveRoute (value) {
        if (value !== localStore.get(localStore.key.ROUTE.SAVE, false)) {
          localStore.set(localStore.key.ROUTE.SAVE, value)
        }
      },
      sizeHistory (value) {
        value = Math.min(15, Math.max(0, value))
        if (value !== localStore.get(localStore.key.HISTORY_SIZE, 5)) {
          this.$store.commit(types.MUTATIONS.CHANGE_HISTORY_SIZE, value)
        }
      },
      homepageFavorite (value) {
        if (value !== localStore.get(localStore.key.HOMEPAGE.FAVORITE, true)) {
          localStore.set(localStore.key.HOMEPAGE.FAVORITE, value)
        }
      },
      homepageNews (value) {
        if (value !== localStore.get(localStore.key.HOMEPAGE.NEWS, true)) {
          localStore.set(localStore.key.HOMEPAGE.NEWS, value)
          Cache.invalidate('news')
        }
      },
      nbNews (value) {
        value = Math.min(20, Math.max(2, value))
        if (value !== localStore.get(localStore.key.HOMEPAGE.NB_NEWS, 10)) {
          localStore.set(localStore.key.HOMEPAGE.NB_NEWS, value)
          Cache.invalidate('news')
        }
      },
      graphFinish (value) {
        if (value !== localStore.get(localStore.key.HOMEPAGE.GRAPH_FINISH, false)) {
          localStore.set(localStore.key.HOMEPAGE.GRAPH_FINISH, value)
        }
      },
      special (value) {
        if (value !== localStore.get(localStore.key.EPISODES.SPECIAL, true)) {
          let intSpecial = (value) ? 1 : 0
          api.members.setOption('specials', intSpecial).then((value) => {
            localStore.set(localStore.key.EPISODES.SPECIAL, (value === 1))
          })
        }
      },
      calendarSave (value) {
        if (value !== localStore.get(localStore.key.CALENDAR.SAVE_DATE, false)) {
          localStore.set(localStore.key.CALENDAR.SAVE_DATE, value)
        }
      },
      timeline (value) {
        value = Math.min(50, Math.max(5, value))
        if (value !== localStore.get(localStore.key.TIMELINE.NB, 30)) {
          Cache.invalidate('timeline')
          localStore.set(localStore.key.TIMELINE.NB, value)
        }
      },
      timelineHimself (value) {
        if (value !== localStore.get(localStore.key.TIMELINE.HIMSELF, false)) {
          Cache.invalidate('timeline')
          localStore.set(localStore.key.TIMELINE.HIMSELF, value)
        }
      },
      commentsNb (value) {
        value = Math.min(50, Math.max(5, value))
        if (value !== localStore.get(localStore.key.COMMENTS.NB, 30)) {
          localStore.set(localStore.key.COMMENTS.NB, value)
        }
      },
      commentsOrder (value) {
        if (value !== localStore.get(localStore.key.COMMENTS.ORDER, 'desc')) {
          localStore.set(localStore.key.COMMENTS.ORDER, value)
        }
      },
      srtVF (value) {
        if (value !== localStore.set(localStore.key.EPISODES.SRT_VF_ONLY, true)) {
          localStore.set(localStore.key.EPISODES.SRT_VF_ONLY, value)
        }
      },
      recommendationInterval (value) {
        if (value !== localStore.get(localStore.key.RECOMMENDATIONS.INTERVAL, 2)) {
          localStore.set(localStore.key.RECOMMENDATIONS.INTERVAL, value)
          this.$store.dispatch(types.recommendations.ACTIONS.INTERVAL_RECOMMENDATION)
        }
      },
      dlAsk (value) {
        if (value !== localStore.get(localStore.key.DOWNLOAD.ASK, true)) {
          localStore.set(localStore.key.DOWNLOAD.ASK, value)
        }
      },
      updateInterval (value) {
        if (value !== localStore.get(localStore.key.UPDATE.INTERVAL, 1)) {
          localStore.set(localStore.key.UPDATE.INTERVAL, value)
          ipcRenderer.send('interval-update', value)
        }
      },
      updateAlpha (value) {
        if (value !== localStore.get(localStore.key.UPDATE.PRERELEASE, false)) {
          localStore.set(localStore.key.UPDATE.PRERELEASE, value)
        }
      },
      beforeArchive (value) {
        if (value !== localStore.get(localStore.key.EPISODES.DAY_BEFORE_ARCHIVE, 16)) {
          localStore.set(localStore.key.EPISODES.DAY_BEFORE_ARCHIVE, value)
        }
      },
    },
    mounted () {
      console.log('[VUE] Mount Options.vue')
      this.load()

      // Get size of cache/DB
      this.fileSize = {
        cache: Cache.getSize(),
        episodes: db.getSize('episodes'),
        shows: db.getSize('shows'),
        subtitles: db.getSize('subtitles'),
        links: db.getSize('links'),
        stats: db.getSize('stats'),
      }
      this.refreshDataCacheSize()
    },
    beforeRouteLeave (to, from, next) {
      if (this.needRestart) {
        remote.dialog.showMessageBox(remote.getCurrentWindow(), {
          type: 'info',
          title: 'Redémarrage',
          message: 'FeedSeries doit redémarrer pour appliquer les paramètres',
          buttons: ['Ok'],
        })
        remote.app.relaunch()
        remote.app.exit(0)
      }
      next()
    },
  }
</script>

<style lang="scss">
  @import "../assets/scss/vars";

  .block-btns {
    margin: 15px 15%;
  }
  .block-btn {
    display: inline-block;
    vertical-align: top;
    max-width: 30%;
    margin-left: 1%;
    border: 1px solid $sidebarBorder;
    background-color: $sidebarbgc;
    padding-bottom: 5px;
    .title {
      font-size: 1.2em;
      border-bottom: 1px solid $sidebarBorder;
    }
    p {
      padding: 0 5px;
    }
    .btns {
      text-align: center;
      .btn {
        margin: 0 auto 5px auto;
        display: block;
      }
    }
    &:first-of-type {
      margin-left: 0;
    }
  }
  .dl-dir {
    display: inline-block;
    min-width: 300px;
    background-color: #FFFFFF;
    padding: 3px 5px;
    color: #000;
    cursor: pointer;
  }
  .strikealpha {
    text-decoration: line-through;
    cursor: not-allowed;
  }
  #options {
    .field-col {
      width: 48%;
      float: left;
      margin: 0 1% 10px 1%;
    }
    fieldset {
      margin: 10px 1%;
    }
  }
</style>
