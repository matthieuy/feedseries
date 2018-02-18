<template>
  <div>
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
    </fieldset>

    <div class="text-center">
      <button class="btn btn-nav" @click="save()"><i class="fa fa-save"></i> Sauvegarder</button>
    </div>
  </div>
</template>

<script>
  import { remote } from 'electron'
  import { mapState } from 'vuex'
  import Autolauch from 'auto-launch'

  import { localStore, types } from '../store/index'
  import { Cache } from '../db/index'

  let launcher = new Autolauch({
    name: remote.app.getName(),
  })

  export default {
    data () {
      return {
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
      }
    },
    computed: {
      ...mapState(['history']),
    },
    methods: {
      load () {
        this.systray = localStore.get(localStore.key.SYSTRAY, true)
        this.route_save = localStore.get(localStore.key.ROUTE.SAVE, false)
        this.timeline = localStore.get(localStore.key.TIMELINE.NB, 30)
        this.timeline_himself = localStore.get(localStore.key.TIMELINE.HIMSELF, false)
        this.srtVF = localStore.get(localStore.key.EPISODES.SRT_VF_ONLY, true)
        this.homepage_favorite = localStore.get(localStore.key.HOMEPAGE.FAVORITE, true)
        this.homepage_news = localStore.get(localStore.key.HOMEPAGE.NEWS, true)
        this.nb_news = localStore.get(localStore.key.HOMEPAGE.NB_NEWS, 10)
        this.sizehistory = localStore.get(localStore.key.HISTORY_SIZE, 5)
        launcher.isEnabled().then((enabled) => {
          this.autoload = enabled
        })
      },
      save () {
        localStore.set(localStore.key.SYSTRAY, this.systray)
        localStore.set(localStore.key.ROUTE.SAVE, this.route_save)
        localStore.set(localStore.key.EPISODES.SRT_VF_ONLY, this.srtVF)
        localStore.set(localStore.key.HOMEPAGE.FAVORITE, this.homepage_favorite)

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

        // Autoload
        if (this.autoload) {
          launcher.enable()
        } else {
          launcher.disable()
        }

        // Notification
        /* eslint-disable no-new */
        new Notification(remote.app.getName(), {
          body: 'Options sauvegardées avec succès !',
        })

        this.load()
      },
      between (value, min, max) {
        return Math.min(max, Math.max(min, value))
      },
    },
    mounted () {
      console.log('[VUE] Mount Options.vue')
      this.load()
    },
  }
</script>
