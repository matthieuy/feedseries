<template>
  <div v-show="show" class="characters">
    <h1 class="text-center">{{ characters.length|plurialize('personnage', 'personnages')}}</h1>
    <div v-for="character in characters" class="character" @contextmenu.prevent="$refs.CharacterCtx.$refs.ctx.open($event, character)">
      <div class="txt-img name">{{ character.name }}</div>
      <img :src="character.picture" v-if="character.picture !== 'https://www.betaseries.com/images/personnages/'">
      <span class="img-replace" v-if="character.picture === 'https://www.betaseries.com/images/personnages/'"></span>
      <div class="txt-img actor">{{ character.actor }}</div>
    </div>
    <character-ctx ref="CharacterCtx">&nbsp;</character-ctx>
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import log from 'electron-log'

  import CharacterCtx from '../context/CharacterCtx'
  import { types } from '../../store'

  export default {
    components: { CharacterCtx },
    computed: {
      ...mapState({
        show: state => state.show.show,
        characters: state => state.show.characters,
      }),
    },
    methods: {
      loadCharacters (show) {
        this.$store.dispatch(types.show.ACTIONS.LOAD_CHARACTERS, show)
      },
    },
    mounted () {
      log.info('[VUE] Mount show:characters')
      this.loadCharacters(this.show)
    },
    beforeRouteUpdate (to, from, next) {
      this.$store.commit(types.show.MUTATIONS.SET_CHARACTERS, [])
      this.loadCharacters({
        _id: to.params.id,
      })
      next()
    },
  }
</script>

<style lang="scss">
  @import "../../assets/scss/vars";
  .characters {
    position: absolute;
    width: calc(100% - 10px);
    display: block;
    clear: both;
    &:after {
      clear: both;
    }
  }
  .character {
    position: relative;
    float: left;
    width: 250px;
    min-height: 375px;
    margin: 10px;
    img, .img-replace {
      position: absolute;
      width: 250px;
      height: 375px;
      top: 0;
      background-color: $sidebarbgc;
    }
    .txt-img {
      position: absolute;
      text-align: center;
      z-index: 5;
      color: #fff;
      background-color: #000;
      opacity: 0.6;
      width: 100%;
    }
    .name {
      top: 0;
    }
    .actor {
      bottom: 0;
    }
  }
</style>
