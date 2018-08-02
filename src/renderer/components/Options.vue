<template>
  <div id="options">
    <h1 class="text-center">Options</h1>

    <fieldset>
      <legend>Système</legend>
      <div class="checkbox">
        <label><input type="checkbox" v-model="systray" /> Réduire dans le systray à la fermeture de la fenêtre</label>
      </div>
      <div class="checkbox">
        <label><input type="checkbox" v-model="whiteicon" /> Icône clair</label>
      </div>
      <div class="checkbox">
        <label><input type="checkbox" v-model="autoload" /> Démarrer avec le système</label>
      </div>
      <div class="checkbox">
        <label><input type="checkbox" v-model="route_save" /> Afficher la dernière page visitée au chargement</label>
      </div>
      <div class="form-group">
        <label>
          Taille de l'historique :
          <input type="number" v-model="sizehistory" max="12" min="1" />
        </label>
      </div>
    </fieldset>

    <fieldset>
      <legend>Accueil</legend>
      <div class="checkbox">
        <label><input type="checkbox" v-model="homepage_favorite" /> Afficher les favoris</label>
      </div>
      <div class="checkbox">
        <label><input type="checkbox" v-model="graph_finish" /> Afficher les séries terminées dans le graph</label>
      </div>
      <div class="checkbox">
        <label><input type="checkbox" v-model="homepage_news" /> Afficher les news </label>
      </div>
      <div class="form-group">
        <label>
          Nombre de news à afficher :
          <input type="number" v-model="nb_news" max="20" min="2" :class="{disabled: !homepage_news }" :disabled="!homepage_news"/>
        </label>
      </div>
    </fieldset>

    <fieldset>
      <legend>Épisodes</legend>
      <div class="checkbox">
        <label><input type="checkbox" v-model="special" /> Afficher les épisodes spéciaux</label>
      </div>
    </fieldset>

    <fieldset>
      <legend>Calendrier</legend>
      <div class="checkbox">
        <label><input type="checkbox" v-model="calendar_save"/> Sauvegarder le dernier mois affiché</label>
      </div>
    </fieldset>

    <fieldset>
      <legend>Timeline</legend>
      <div class="form-group">
        <label>
          Nombre d'évènements par page :
          <input type="number" v-model="timeline" max="50" min="5"/>
        </label>
      </div>
      <div class="checkbox">
        <label><input type="checkbox" v-model="timeline_himself" /> Inclure ses actions</label>
      </div>
    </fieldset>

    <fieldset>
      <legend>Commentaires</legend>
      <div class="form-group">
        <label>
          Nombre de commentaires par page :
          <input type="number" v-model="comments_nb" max="50" min="5" />
        </label>
      </div>
      <div class="form-group">
        <label>
          Ordre d'affichage :
          <select v-model="comments_order">
            <option value="asc">Croissant</option>
            <option value="desc">Décroissant</option>
          </select>
        </label>
      </div>
    </fieldset>

    <fieldset>
      <legend>Sous-titres</legend>
      <div class="checkbox">
        <label><input type="checkbox" v-model="srtVF" /> Afficher uniquement les sous-titres français</label>
      </div>
      <div class="form-group">
          Dossier de téléchargement : <span class="dl_dir" @click="changeDlDir()">{{ dl_dir }}</span>
      </div>
      <div class="checkbox">
        <label><input type="checkbox" v-model="dl_ask" /> Demander où télécharger les sous-titres</label>
      </div>
    </fieldset>

    <fieldset>
      <legend>Mise à jour</legend>
      <div class="checkbox">
        <label :class="{strike: !update_alpha}"><input type="checkbox" v-model="update_alpha" readonly disabled />Récupérer les versions non stable</label>
      </div>
      <div class="form-group">
        <label>
          Intervalle entre 2 vérifications automatique :
          <select v-model="update_interval">
            <option value="1">1 heure</option>
            <option value="6">6 heures</option>
            <option value="12">12 heures</option>
            <option value="24">24 heures</option>
            <option value="168">7 jours</option>
            <option value="0">jamais</option>
          </select>
        </label>
      </div>
    </fieldset>

    <fieldset>
      <legend>Recommandations</legend>
      <div class="form-group">
        <label>
          Intervalle entre 2 vérifications de nouvelles recommandations :
          <select v-model="recommendation_interval">
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
    </fieldset>

    <fieldset>
      <legend>Cache et bases de données</legend>
      <div class="btn-list">
        <button class="btn btn-nav" @click="clearCache()" v-show="fileSize.cache">Vider le cache local ({{ fileSize.cache | size }})</button>
        <button class="btn btn-nav" @click="rmCacheData()">
          Supprimer les fichiers en cache <span v-show="fileSize.data">({{ fileSize.data | size }})</span>
        </button>
        <button class="btn btn-nav" v-show="fileSize.shows" @click="clearDb('shows')">
          Vider la BDD des séries ({{ fileSize.shows | size }})
        </button>
        <button class="btn btn-nav" v-show="fileSize.episodes" @click="clearDb('episodes')">
          Vider la BDD des épisodes ({{ fileSize.episodes | size }})
        </button>
        <button class="btn btn-nav" v-show="fileSize.subtitles" @click="clearDb('subtitles')">
          Vider la BDD des sous-titres ({{ fileSize.subtitles | size }})
        </button>
        <button class="btn btn-nav" v-show="fileSize.links" @click="clearDb('links')">
          Vider la BDD des liens ({{ fileSize.links | size }})
        </button>
      </div>
    </fieldset>

    <div class="text-center btn-list">
      <button class="btn btn-nav" @click="save()"><i class="fa fa-save"></i> Sauvegarder</button>
      <button class="btn btn-nav" @click="purge()"><i class="fa fa-trash"></i> Réinitialiser</button>
      <button class="btn btn-nav" @click="openConf()" v-if="env === 'development'"><i class="fa fa-pencil-alt"></i>Éditer le fichier de configuration</button>
    </div>
    <div class="clearfix"></div>
  </div>
</template>

<script>
  import { remote, ipcRenderer } from 'electron'
  import { mapState } from 'vuex'
  import Autolauch from 'auto-launch'

  import api from '../api'
  import { localStore, types } from '../store/index'
  import db, { Cache } from '../db'

  let launcher = new Autolauch({
    name: remote.app.getName(),
    isHidden: true,
  })

  export default {
    data () {
      return {
        env: process.env.NODE_ENV,
        fileSize: {},
        needRestart: false,
        systray: true,
        autoload: false,
        route_save: false,
        timeline: 30,
        timeline_himself: false,
        srtVF: true,
        homepage_favorite: true,
        homepage_news: true,
        graph_finish: false,
        nb_news: 10,
        sizehistory: 5,
        dl_dir: '',
        dl_ask: true,
        update_alpha: false,
        update_interval: 1,
        special: true,
        comments_nb: 30,
        comments_order: 'desc',
        recommendation_interval: 2,
        whiteicon: false,
        calendar_save: false,
      }
    },
    computed: {
      ...mapState(['history']),
    },
    methods: {
      /**
       * Load the configuration from localStore
       */
      load () {
        this.systray = localStore.get(localStore.key.SYSTRAY, true)
        this.route_save = localStore.get(localStore.key.ROUTE.SAVE, false)
        this.timeline = localStore.get(localStore.key.TIMELINE.NB, 30)
        this.timeline_himself = localStore.get(localStore.key.TIMELINE.HIMSELF, false)
        this.special = localStore.get(localStore.key.EPISODES.SPECIAL, true)
        this.srtVF = localStore.get(localStore.key.EPISODES.SRT_VF_ONLY, true)
        this.homepage_favorite = localStore.get(localStore.key.HOMEPAGE.FAVORITE, true)
        this.homepage_news = localStore.get(localStore.key.HOMEPAGE.NEWS, true)
        this.graph_finish = localStore.get(localStore.key.HOMEPAGE.GRAPH_FINISH, false)
        this.nb_news = localStore.get(localStore.key.HOMEPAGE.NB_NEWS, 10)
        this.sizehistory = localStore.get(localStore.key.HISTORY_SIZE, 5)
        this.dl_dir = localStore.get(localStore.key.DOWNLOAD.DIR, remote.app.getPath('downloads'))
        this.dl_ask = localStore.get(localStore.key.DOWNLOAD.ASK, true)
        this.update_alpha = localStore.get(localStore.key.UPDATE.PRERELEASE, false)
        this.update_interval = localStore.get(localStore.key.UPDATE.INTERVAL, 1)
        this.comments_nb = localStore.get(localStore.key.COMMENTS.NB, 30)
        this.comments_order = localStore.get(localStore.key.COMMENTS.ORDER, 'desc')
        this.recommendation_interval = localStore.get(localStore.key.RECOMMENDATIONS.INTERVAL, 2)
        this.whiteicon = localStore.get(localStore.key.WHITE_ICON, false)
        this.calendar_save = localStore.get(localStore.key.CALENDAR.SAVE_DATE, false)
      },
      /**
       * Save the configuration
       */
      save () {
        localStore.set(localStore.key.SYSTRAY, this.systray)
        localStore.set(localStore.key.ROUTE.SAVE, this.route_save)
        localStore.set(localStore.key.EPISODES.SRT_VF_ONLY, this.srtVF)
        localStore.set(localStore.key.HOMEPAGE.FAVORITE, this.homepage_favorite)
        localStore.set(localStore.key.HOMEPAGE.GRAPH_FINISH, this.graph_finish)
        localStore.set(localStore.key.DOWNLOAD.ASK, this.dl_ask)
        localStore.set(localStore.key.UPDATE.PRERELEASE, this.update_alpha)
        localStore.set(localStore.key.COMMENTS.NB, this.between(this.comments_nb, 5, 50))
        localStore.set(localStore.key.COMMENTS.ORDER, this.comments_order)
        localStore.set(localStore.key.CALENDAR.SAVE_DATE, this.calendar_save)

        // Tray icon
        if (this.whiteicon !== localStore.get(localStore.key.WHITE_ICON, false)) {
          localStore.set(localStore.key.WHITE_ICON, this.whiteicon)
          ipcRenderer.send('update-tray')
        }

        // Timeline
        if (this.timeline !== localStore.get(localStore.key.TIMELINE.NB, 30) || this.timeline_himself !== localStore.get(localStore.key.TIMELINE.HIMSELF, false)) {
          Cache.invalidate('timeline')
        }
        localStore.set(localStore.key.TIMELINE.NB, this.between(this.timeline, 5, 50))
        localStore.set(localStore.key.TIMELINE.HIMSELF, this.timeline_himself)

        // News
        if (this.homepage_news !== localStore.get(localStore.key.HOMEPAGE.NEWS, true) || this.nb_news !== localStore.get(localStore.key.HOMEPAGE.NB_NEWS, 10)) {
          Cache.invalidate('news')
        }
        localStore.set(localStore.key.HOMEPAGE.NEWS, this.homepage_news)
        localStore.set(localStore.key.HOMEPAGE.NB_NEWS, this.nb_news)

        // History
        if (this.sizehistory !== localStore.get(localStore.key.HISTORY_SIZE, 5)) {
          this.$store.commit(types.MUTATIONS.CHANGE_HISTORY_SIZE, this.sizehistory)
        }

        // Update
        localStore.set(localStore.key.UPDATE.INTERVAL, this.update_interval)
        ipcRenderer.send('interval-update', this.update_interval)

        // Special
        if (this.special !== localStore.get(localStore.key.EPISODES.SPECIAL, true)) {
          let intSpecial = (this.special) ? 1 : 0
          api.members.setOption('specials', intSpecial).then((value) => {
            value = (value === 1)
            localStore.set(localStore.key.EPISODES.SPECIAL, value)
            this.special = value
          })
        }

        // Recommendation
        if (this.recommendation_interval !== localStore.get(localStore.key.RECOMMENDATIONS.INTERVAL, 2)) {
          localStore.set(localStore.key.RECOMMENDATIONS.INTERVAL, this.recommendation_interval)
          clearInterval(window.recommendation)
          window.recommendation = setInterval(() => {
            this.$store.dispatch(types.recommendations.ACTIONS.LOAD_RECOMMENDATIONS)
          }, localStore.get(localStore.key.RECOMMENDATIONS.INTERVAL, 2) * 3600000)
        }

        // Autoload
        launcher.isEnabled().then((enabled) => {
          if (this.autoload !== enabled) {
            if (this.autoload) {
              launcher.enable()
            } else {
              launcher.disable()
            }
          }
        })

        // Notification
        this.addNotification('Options sauvegardées avec succès !')

        this.load()
      },
      /**
       * Change download directory
       */
      changeDlDir () {
        remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
          title: 'Dossier de téléchargement des sous-titres',
          defaultPath: this.dl_dir,
          properties: ['openDirectory', 'createDirectory'],
        }, (dirpath) => {
          if (typeof dirpath !== 'undefined') {
            this.dl_dir = dirpath[0]
            localStore.set(localStore.key.DOWNLOAD.DIR, this.dl_dir)
          }
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
       * Clear the local cache
       */
      clearCache () {
        Cache.reset()
        this.addNotification('Cache vidé avec succès !')
        this.fileSize.cache = Cache.getSize()
      },
      /**
       * Clear a DB
       * @param {String} name The DB name
       */
      clearDb (name) {
        db.clearDb(name).then(() => {
          console.log(`[DB] Delete "${name}.db"`)
          this.addNotification('Purge de la base de donnée avec succès !')
          this.fileSize[name] = db.getSize(name)
        })
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
        let whiteIcon = (localStore.get(localStore.key.WHITE_ICON, true)) ? '-w' : '-b'

        /* eslint-disable no-new */
        new window.Notification(remote.app.getName(), {
          body: text,
          icon: 'static/icons/icon' + whiteIcon + '.png',
        })
      },
      /**
       * Open config in editor
       */
      openConf () {
        localStore.openInEditor()
      },
      /**
       * Get value with limit
       * @param {Integer} value
       * @param {Integer} min
       * @param {Integer} max
       * @private
       * @return {Integer}
       */
      between (value, min, max) {
        return Math.min(max, Math.max(min, value))
      },
      /**
       * Refresh (async) the cache data size
       */
      refreshDataCacheSize () {
        Cache.getCacheDataSize().then((size) => {
          this.$set(this.fileSize, 'data', size)
        })
      },
    },
    mounted () {
      console.log('[VUE] Mount Options.vue')
      this.load()
      launcher.isEnabled().then((enabled) => {
        this.autoload = enabled
      })

      // Get size of cache/DB
      this.fileSize = {
        cache: Cache.getSize(),
        episodes: db.getSize('episodes'),
        shows: db.getSize('shows'),
        subtitles: db.getSize('subtitles'),
        links: db.getSize('links'),
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
  .btn-list .btn {
    margin-bottom: 15px;
  }
  .dl_dir {
    background-color: #FFFFFF;
    padding: 3px 5px;
    color: #000;
    cursor: pointer;
  }
  .strike {
    text-decoration: line-through;
  }
</style>
