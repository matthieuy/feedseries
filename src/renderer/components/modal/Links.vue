<template>
  <div v-show="show">
    <h1 class="text-center">{{ show.title }}</h1>

    <div class="link-item" v-for="link in links">
      <div class="img pull-left">
        <img :src="link.icon" alt="" width="24" height="24" onerror="this.src='static/empty.png'">
      </div>
      <div>
        <div class="link-title">
          {{ link.name }}
          <i class="fa fa-pencil-alt cursor" @click="selectLink(link)" title="Modifier"></i>
          <i class="fa fa-minus-circle cursor" @click="deleteLink(link)" title="Supprimer"></i>
        </div>
        <div class="link-url">{{ link.url }}</div>
      </div>
      <div class="clearfix"></div>
    </div>

    <fieldset>
      <div class="form-group">
        <label>Adresse :</label>
        <input id="url" type="url" class="form-control" placeholder="https://..." v-model="url" v-on:keyup.enter="enterKey()" autofocus required/>
      </div>
      <div class="form-group">
        <label for="name">Nom :</label>
        <input id="name" type="text" class="form-control" placeholder="Titre" v-model="name" v-on:keyup.enter="enterKey()" required maxlength="20" />
      </div>

      <div class="form-actions text-center">
        <button class="btn btn-default" v-show="!idLink" @click="add()"><i class="fa fa-plus-circle"></i> Ajouter</button>
        <button class="btn btn-default" v-show="idLink" @click="edit()"><i class="fa fa-plus-circle"></i> Modifier</button>
        <button class="btn btn-danger" @click="reset()"><i class="fa fa-times-circle"></i> Annuler</button>
      </div>
    </fieldset>
  </div>
</template>

<script>
  import { Show, Link } from '../../db'
  import ModalRenderer from '../../tools/ModalRenderer'

  let modal

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
          showId: this.show._id,
          name: this.name,
          url: this.url,
        })
        this.sendLinkActionToParent('add', link)
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
          link.showId = this.show._id
          link.name = this.name
          link.url = this.url
          this.sendLinkActionToParent('edit', link)
          return true
        }
        return false
      },
      /**
       * Press enter key
       */
      enterKey () {
        return (this.idLink) ? this.edit() : this.add()
      },
      /**
       * Delete a link
       * @param {Link} link
       */
      deleteLink (link) {
        this.sendLinkActionToParent('delete', link)
      },
      /**
       * Select a link (to edit)
       * @param {Link} link
       */
      selectLink (link) {
        this.idLink = link._id
        this.name = link.name
        this.url = link.url
        document.getElementById('name').focus()
      },
      /**
       * Reset Form
       */
      reset () {
        this.idLink = null
        this.name = ''
        this.url = ''
        document.getElementById('name').focus()
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
      /**
       * Send a action link to parent window
       * @param {String} action (add|edit|delete)
       * @param {Link} link
       */
      sendLinkActionToParent (action, link) {
        link = (link) ? link.toJSON() : null
        modal.sendToParent(action, link)
      },
    },
    watch: {
      url (value) {
        if (value.length && !this.name.length) {
          let regex = new RegExp(/https?:\/\/(\D*)\//i)
          let match = regex.exec(value)
          if (match.length === 2) {
            this.name = match[1]
          }
        }
      },
    },
    mounted () {
      console.log('[VUE] Mount modal/Links.vue')

      // Get the current show
      Show.getById(this.$route.params.id).then((show) => {
        this.show = show
      })

      // Receive links list from parent window
      modal = new ModalRenderer('links')
      modal.on('complete-list', (links) => {
        this.links = []
        links.forEach((a) => {
          delete a._schema
          this.links.push(Link.create(a))
        })
        this.reset()
      }).sendToParent('ask-list')
    },
  }
</script>

<style lang="scss">
  $rootFont: '../../';
  @import "../../assets/scss/theme";
  body {
    overflow-y: auto;
  }
  .link-item {
    margin: 5px 15px;
    clear: both;
    height: 50px;
    .img {
      margin-right: 15px;
      height: 24px;
      width: 24px;
    }
    .link-title {
      font-size: 1.1em;
      color: $txtColor;
      font-weight: bold;
      .fa {
        font-size: 0.9em;
        margin-left: 3px;
      }
      .fa-minus-circle {
        color: Tomato;
      }
    }
    .link-url {
      color: $navColor;
      font-style: italic;
      max-height: 20px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  .form-actions {
    .fa {
      margin-right: 3px;
    }
  }
</style>
