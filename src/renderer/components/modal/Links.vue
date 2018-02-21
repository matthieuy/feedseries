<template>
  <div v-show="show">
    <h1 class="text-center">{{ show.title }}</h1>

    <div class="link-item" v-for="link in links">
      <div class="img pull-left" :style="bgIcon(link)"></div>
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
        <label for="name">Nom :</label>
        <input id="name" type="text" class="form-control" placeholder="Titre" v-model="name" required maxlength="20" />
      </div>
      <div class="form-group">
        <label>Adresse :</label>
        <input id="url" type="url" class="form-control" placeholder="https://..." v-model="url" required/>
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
      bgIcon (link) {
        return `background-image: url('${link.icon}');`
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
  .link-item {
    margin: 5px 15px;
    clear: both;
    height: 50px;
    .img {
      margin-right: 15px;
      height: 24px;
      width: 24px;
      background-size: cover;
      background-position: top center;

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
