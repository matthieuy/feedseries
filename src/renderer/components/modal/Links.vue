<template>
  <div v-show="show">
    <h1 class="text-center">{{ show.title }}</h1>

    <ul>
      <li v-for="link in links">
        <img :src="link.icon" alt="">
        {{ link.name }}
        {{ link.url }}
        <button class="btn btn-default" @click="selectLink(link)">Modifier</button>
        <button class="btn btn-default" @click="deleteLink(link)">Supprimer</button>
      </li>
    </ul>

    <fieldset>
      <div class="form-group">
        <label for="name">Nom :</label>
        <input id="name" type="text" class="form-control" placeholder="Titre" v-model="name" required/>
      </div>
      <div class="form-group">
        <label>Adresse :</label>
        <input id="url" type="url" class="form-control" placeholder="https://..." v-model="url" required/>
      </div>

      <div class="form-actions">
        <button class="btn btn-default" v-show="!idLink" @click="add()"><i class="fa fa-plus-circle"></i> Ajouter</button>
        <button class="btn btn-default" v-show="idLink" @click="edit()"><i class="fa fa-plus-circle"></i> Modifier</button>
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
        name: '',
        url: '',
      }
    },
    methods: {
      /**
       * Add a link
       */
      add () {
        if (!this.isFormValid()) {
          return false
        }

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
       * Edit a link
       */
      edit () {
        if (!this.isFormValid()) {
          return false
        }

        let index = this.links.findIndex((a) => a._id === this.idLink)
        if (index > -1) {
          let link = this.links[index]
          link.show = this.show
          link.name = this.name
          link.url = this.url
          link.save().then(() => {
            this.reset()
          })
          return true
        }
        return false
      },
      /**
       * Delete a link
       * @param {Link} link
       */
      deleteLink (link) {
        let index = this.links.findIndex((a) => a._id === link._id)
        link.delete().then((ar) => {
          this.$delete(this.links, index)
          this.reset()
        })
      },
      /**
       * Select a link (to edit)
       * @param {Link} link
       */
      selectLink (link) {
        this.idLink = link._id
        this.name = link.name
        this.url = link.url
      },
      /**
       * Reset Form
       */
      reset () {
        this.idLink = null
        this.name = ''
        this.url = ''
      },
      /**
       * Check form
       * @return {boolean}
       */
      isFormValid () {
        if (!this.name.length) {
          document.getElementById('name').focus()
          return false
        }
        if (!this.url.length || !/https?:\/\/.+/g.test(this.url)) {
          document.getElementById('url').focus()
          return false
        }

        return true
      },
    },
    mounted () {
      console.log('[VUE] Mount modal/Links.vue')
      Link.getLinks({id: this.$route.params.id}).then((links) => {
        this.links = links
      })
      Show.getById(this.$route.params.id).then((show) => {
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
