<template>
  <div>
    Links
  </div>
</template>

<script>
  import { Show, Link } from '../../db'

  export default {
    data () {
      return {
        links: [],
      }
    },
    methods: {
    },
    mounted () {
      console.log('[VUE] Mount modal/Links.vue')
      Link.getLinks({id: this.$route.params.id}).then((links) => {
        this.links = links
      }
    },
  }
</script>

<style lang="scss">
  $rootFont: '../../';
  @import "../../assets/scss/theme";
  h1 {}
</style>
