<template>
  <div v-show="show" class="timeline">
    <h1 class="text-center">Historique</h1>
    <timeline :show="show" :displayAvatar="false" :linkEnable="false"></timeline>
  </div>
</template>

<script>
  import { mapState } from 'vuex'

  import Timeline from '../Timeline'

  export default {
    components: {
      Timeline,
    },
    computed: {
      ...mapState({
        show: state => state.show.show,
      }),
    },
    mounted () {
      console.log('[VUE] Mount Show:TimelineShow')
    },
  }
</script>
