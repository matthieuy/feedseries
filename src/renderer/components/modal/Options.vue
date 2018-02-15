<template>
  <div>
    <h1 class="text-center">Options</h1>

    <fieldset>
      <legend>Système</legend>
      <div class="checkbox">
        <label><input type="checkbox" v-model="systray" /> Réduire dans le systray à la fermeture de la fenêtre</label>
      </div>
      <div class="checkbox">
        <label><input type="checkbox" v-model="route_save" /> Afficher la dernière page visitée au chargement</label>
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

    <div class="text-center">
      <button class="btn btn-nav" @click="save()"><i class="fa fa-save"></i> Sauvegarder</button>
    </div>
  </div>
</template>

<script>
  import { localStore } from '../../store'
  import { Cache } from '../../db'

  export default {
    data () {
      return {
        systray: true,
        route_save: false,
        timeline: 30,
        timeline_himself: false,
      }
    },
    methods: {
      load () {
        this.systray = localStore.get(localStore.key.SYSTRAY, true)
        this.route_save = localStore.get(localStore.key.ROUTE.SAVE, false)
        this.timeline = localStore.get(localStore.key.TIMELINE.NB, 30)
        this.timeline_himself = localStore.get(localStore.key.TIMELINE.HIMSELF, false)
      },
      save () {
        localStore.set(localStore.key.SYSTRAY, this.systray)
        localStore.set(localStore.key.ROUTE.SAVE, this.route_save)

        // Timeline
        if (this.timeline !== localStore.get(localStore.key.TIMELINE.NB, 30) || this.timeline_himself !== localStore.get(localStore.key.TIMELINE.HIMSELF, false)) {
          Cache.invalidate('timeline')
        }
        localStore.set(localStore.key.TIMELINE.NB, Math.min(50, Math.max(5, this.timeline)))
        localStore.set(localStore.key.TIMELINE.HIMSELF, this.timeline_himself)
      },
    },
    mounted () {
      console.log('[VUE] Mount Options.vue')
      this.load()
    },
  }
</script>

<style lang="scss">
  @import "../../assets/scss/vars";
  @import "../../assets/scss/photon/global";
  @import "../../assets/scss/photon/buttons";
  @import "../../assets/scss/photon/form";
  $rootFont: "../../";
  @import "../../assets/scss/fa";

</style>
