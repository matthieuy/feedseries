<template>
  <div id="options">
    <h1 class="text-center">Options</h1>

    <fieldset>
      <legend>Système</legend>
      <div class="checkbox">
        <label><input type="checkbox" v-model="systray" /> Réduire dans le systray à la fermeture de la fenêtre</label>
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
      <legend>Timeline</legend>
      <div class="form-group">
        <label>
          Nombre d'évènement à charger :
          <input type="number" v-model="timeline" max="50" min="5"/>
        </label>
      </div>
      <div class="checkbox">
        <label><input type="checkbox" v-model="timeline_himself" /> Inclure ses actions</label>
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
    </fieldset>

    <div class="text-center btn-list">
      <button class="btn btn-nav" @click="openConf()" v-if="env === 'development'"><i class="fa fa-pencil-alt"></i>Éditer le fichier de configuration</button>
      <button class="btn btn-nav" @click="purge()"><i class="fa fa-trash"></i> Réinitialiser</button>
      <button class="btn btn-nav" @click="save()"><i class="fa fa-save"></i> Sauvegarder</button>
    </div>
    <div class="clearfix"></div>
  </div>
</template>

<script>
  import { remote } from 'electron'
  import { mapState } from 'vuex'
  import Autolauch from 'auto-launch'

  import api from '../api'
  import { localStore, types } from '../store/index'
  import { Cache } from '../db'

  let launcher = new Autolauch({
    name: remote.app.getName(),
    isHidden: true,
  })

  export default {
    data () {
      return {
        env: process.env.NODE_ENV,
        systray: true,
        autoload: false,
        route_save: false,
        timeline: 30,
        timeline_himself: false,
        srtVF: true,
        homepage_favorite: true,
        homepage_news: true,
        nb_news: 10,
        sizehistory: 5,
        dl_dir: '',
        dl_ask: true,
        update_alpha: false,
        special: true,
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
        this.nb_news = localStore.get(localStore.key.HOMEPAGE.NB_NEWS, 10)
        this.sizehistory = localStore.get(localStore.key.HISTORY_SIZE, 5)
        this.dl_dir = localStore.get(localStore.key.DOWNLOAD.DIR, remote.app.getPath('downloads'))
        this.dl_ask = localStore.get(localStore.key.DOWNLOAD.ASK, true)
        this.update_alpha = localStore.get(localStore.key.UPDATE.PRERELEASE, false)
      },
      /**
       * Save the configuration
       */
      save () {
        localStore.set(localStore.key.SYSTRAY, this.systray)
        localStore.set(localStore.key.ROUTE.SAVE, this.route_save)
        localStore.set(localStore.key.EPISODES.SRT_VF_ONLY, this.srtVF)
        localStore.set(localStore.key.HOMEPAGE.FAVORITE, this.homepage_favorite)
        localStore.set(localStore.key.DOWNLOAD.ASK, this.dl_ask)
        localStore.set(localStore.key.UPDATE.PRERELEASE, this.update_alpha)

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

        // Special
        if (this.special !== localStore.get(localStore.key.EPISODES.SPECIAL, true)) {
          let intSpecial = (this.special) ? 1 : 0
          api.members.setOption('specials', intSpecial).then((value) => {
            value = (value === 1)
            localStore.set(localStore.key.EPISODES.SPECIAL, value)
            this.special = value
          })
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
        /* eslint-disable no-new */
        new window.Notification(remote.app.getName(), {
          body: 'Options sauvegardées avec succès !',
          icon: 'static/icons/icon.png',
        })

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
       * Open config in editor
       */
      openConf () {
        localStore.openInEditor()
      },
      between (value, min, max) {
        return Math.min(max, Math.max(min, value))
      },
    },
    mounted () {
      console.log('[VUE] Mount Options.vue')
      this.load()
      launcher.isEnabled().then((enabled) => {
        this.autoload = enabled
      })
    },
  }
</script>

<style lang="scss">
  .btn-list {
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
