<template>
  <div v-show="show">
    <h1 class="text-center">{{ show.title }}</h1>

    <ul>
      <li v-for="link in links">
        <img :src="link.icon">
        {{ link.name }}
        {{ link.url }}
      </li>
    </ul>

    <fieldset>
      <div class="form-group">
        <label for="name">Nom :</label>
        <input id="name" type="text" class="form-control" placeholder="Titre" v-model="name" />
      </div>
      <div class="form-group">
        <label>Adresse :</label>
        <input id="url" type="url" class="form-control" placeholder="https://..." v-model="url" />
      </div>

      <div class="form-actions">
        <button class="btn btn-default" v-show="!idLink" @click="add()"><i class="fa fa-plus-circle"></i> Ajouter</button>
        <button class="btn btn-default" v-show="idLink"><i class="fa fa-plus-circle"></i> Modifier</button>
        <button class="btn btn-danger" @click="reset()"><i class="fa fa-times-circle"></i> Annuler</button>
      </div>
    </fieldset>
  </div>
</template>

<script>
  import { Show, Link } from '../../db'

  export default {
    data () {
      return {
        show: false,
        links: [],
        idLink: null,
        name: 'Test',
        url: 'https://stackoverflow.com/questions/1420881/how-to-extract-base-url-from-a-string-in-javascript',
      }
    },
    methods: {
      /**
       * Add a link
       */
      add () {
        let link = Link.create({
          show: this.show,
          name: this.name,
          url: this.url,
        })
        link.save().then((linkSaved) => {
          this.reset()
          this.links.push(linkSaved)
        })
      },
      /**
       * Reset Form
       */
      reset () {
        this.idLink = null
        this.name = null
        this.url = null
      },
    },
    mounted () {
      console.log('[VUE] Mount modal/Links.vue')
      Link.getLinks({id: this.$route.params.id}).then((links) => {
        this.links = links
      })
      Show.getById(this.$route.params.id).then((show) => {
        console.log(show)
        this.show = show
      })
    },
  }
</script>

<style lang="scss">
  $rootFont: '../../';
  @import "../../assets/scss/theme";
  h1 {}
</style>
