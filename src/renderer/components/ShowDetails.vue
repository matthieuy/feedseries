<template>
  <div class="window">
    <div class="pane-group">
      <div class="pane-sm sidebar">
        <nav class="nav-group">
          <h5 class="nav-group-title">Fiche de la série</h5>
          <router-link :to="{name: 'show', params: { id: $route.params.id }}" :class="{active: $route.name === 'show'}" class="nav-group-item">
            <i class="fa fa-id-card"></i> Résumé
          </router-link>
          <router-link :to="{name: 'show.characters', params: { id: $route.params.id }}" :class="{active: $route.name === 'show.characters'}" class="nav-group-item">
            <i class="fa fa-child"></i>
            <span>Personnages</span>
          </router-link>
          <router-link :to="{name: 'show.comments', params: { id: $route.params.id }}" :class="{active: $route.name === 'show.comments'}" class="nav-group-item">
            <i class="fa fa-comments"></i>
            <span>Commentaires</span>
          </router-link>
          <router-link :to="{name: 'show.similars', params: { id: $route.params.id }}" :class="{active: $route.name === 'show.similars'}" class="nav-group-item">
            <i class="fa fa-paste"></i>
            <span>Séries similaires</span>
          </router-link>
          <router-link :to="{name: 'show.suggest', params: { id: $route.params.id }}" :class="{active: $route.name === 'show.suggest'}" class="nav-group-item">
            <i class="fa fa-thumbs-up"></i> Recommander
          </router-link>
          <router-link :to="{name: 'show.timeline', params: { id: $route.params.id }}" :class="{active: $route.name === 'show.timeline'}" class="nav-group-item">
            <i class="fa fa-history"></i> Historique
          </router-link>
        </nav>
        <nav class="nav-group">
          <h5 class="nav-group-title">Actions</h5>
          <div class="nav-group-item" v-show="show && !show.in_account">
            <div class="btn btn-nav btn-action cursor" @click="addShow()">
              <i class="fa fa-plus-circle"></i> Ajouter la série
            </div>
          </div>
          <div class="nav-group-item" v-show="show.in_account && !show.isArchived">
            <button class="btn btn-nav btn-action cursor" @click="archive(true)">
              <i class="fa fa-archive"></i> Archiver
            </button>
          </div>
          <div class="nav-group-item" v-show="show.in_account && show.isArchived">
            <button class="btn btn-nav btn-action cursor" @click="archive(false)">
              <i class="fa fa-archive"></i> Sortir des archives
            </button>
          </div>
          <div class="nav-group-item" v-show="show && show.in_account && !show.isFavorited">
            <button class="btn btn-nav btn-action cursor" @click="favorite(true)">
              <i class="fa fa-heart"></i> Ajouter aux favoris
            </button>
          </div>
          <div class="nav-group-item" v-show="show && show.isFavorited">
            <button class="btn btn-nav btn-action cursor" @click="favorite(false)">
              <i class="fa fa-heart"></i> Retirer des favoris
            </button>
          </div>
          <div class="nav-group-item" v-show="show.in_account">
            <button class="btn btn-nav btn-action btn-delete-show cursor" @click="deleteShow()">
              <i class="fa fa-trash"></i> Supprimer la série
            </button>
          </div>
        </nav>
        <nav class="nav-group" v-show="show">
          <h5 class="nav-group-title">Liens</h5>
          <a v-for="link in links" @click="openURL(link)" class="nav-group-item">
            <img :src="link.icon" width="16" height="16" onerror="this.src='static/empty.png'"> {{ link.name }}
          </a>

          <a v-show="show.slug" @click="openURL('bs')" class="nav-group-item"><img src="static/links/bs.png"> BetaSeries</a>
          <a v-show="show.imdb" @click="openURL('imdb')" class="nav-group-item"><img src="static/links/imdb.png"> IMDb</a>
          <a v-show="show.tvdb" @click="openURL('tvdb')" class="nav-group-item"><img src="static/links/tvdb.png"> TheTVDB</a>
          <a class="nav-group-item" @click="openLinkManager()" v-show="show.in_account">
            <i class="fa fa-plus-circle"></i> Gérer les liens
          </a>
        </nav>
      </div>
      <div class="pane">
        <div class="text-center" v-show="isLoading">
          <i class="fa fa-spinner fa-spin"></i> <span class="ellipse-loading">Chargement en cours</span>
        </div>
        <h1 class="text-center" v-show="notFound">
          Série introuvable
        </h1>
        <div v-if="show">
          <div class="header" :style="{backgroundImage: backgroundImg}">
            <h1>
              {{ show.title }}
              <span class="date">{{ show.creation }}</span>
              <i class="fa fa-circle" :style="show.status | statusColor"></i>
            </h1>
          </div>
          <div class="body">
            <router-view>&nbsp;</router-view>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import { remote } from 'electron'
  import ModalRenderer from '../tools/ModalRenderer'

  import { types } from '../store'
  import { Link } from '../db'

  export default {
    data () {
      return {
        isLoading: true,
        notFound: false,
        links: [],
      }
    },
    computed: {
      ...mapState({
        show: state => state.show.show,
      }),
      // Get CSS background header url
      backgroundImg () {
        if (this.show && this.show.image) {
          return `url('https://pictures.betaseries.com/fonds/show/${this.show.image}')`
        }
        return 'none'
      },
    },
    methods: {
      openLinkManager () {
        let modal = new ModalRenderer('links')
        modal.openModal(`/show/${this.show._id}/links`, {
          title: this.show.title + ' - Liens',
          width: 450,
          height: 550,
        })

        // Response : send links list to modal
        let responseIPC = () => {
          Link.getLinks(this.show._id).then((links) => {
            modal.sendToModal('complete-list', links)
            this.links = links
          })
        }

        modal
          .on('ask-list', responseIPC)
          .on('add', (links) => {
            Link.create(links).save().then(responseIPC)
          })
          .on('edit', (link) => {
            Link.updateOrCreate(link).then(responseIPC)
          })
          .on('delete', (link) => {
            Link.deleteOne({ _id: link._id }).then(responseIPC)
          })
      },
      /**
       * (un)archive a show
       * @param {Boolean} add archive or not
       */
      archive (add) {
        let action = (add) ? types.shows.ACTIONS.ARCHIVE : types.shows.ACTIONS.UNARCHIVE
        this.$store.dispatch(action, this.show).then((show) => {
          this.$store.commit(types.show.MUTATIONS.SET_SHOW, show)
        })
      },
      /**
       * (un)favorite a show
       * @param {Boolean} add favorite or not
       */
      favorite (add) {
        let action = (add) ? types.shows.ACTIONS.FAVORITE : types.shows.ACTIONS.UNFAVORITE
        this.$store.dispatch(action, this.show).then((show) => {
          this.$store.commit(types.show.MUTATIONS.SET_SHOW, show)
        })
      },
      /**
       * Delete a show
       */
      deleteShow () {
        remote.dialog.showMessageBox(remote.getCurrentWindow(), {
          buttons: ['Supprimer', 'Annuler'],
          defaultId: 0,
          title: this.show.title,
          message: 'Êtes-vous sûr de vouloir supprimer la série de votre compte ?',
          cancelId: 1,
        }, (response) => {
          if (response === 0) {
            this.$store.dispatch(types.shows.ACTIONS.DELETE, this.show).then((show) => {
              this.$store.commit(types.show.MUTATIONS.SET_SHOW, show)
            })
          }
        })
      },
      /**
       * Add a show
       */
      addShow () {
        this.$store.dispatch(types.shows.ACTIONS.ADD, this.show).then((show) => {
          this.$store.commit(types.show.MUTATIONS.SET_SHOW, show)
        })
      },
      /**
       * Open external link
       * @param {String} type (bs|tvdb|imdb)
       */
      openURL (type) {
        let url = ''
        switch (type) {
          case 'bs':
            url = `https://www.betaseries.com/serie/${this.show.slug}`
            break
          case 'tvdb':
            url = `https://www.thetvdb.com/?tab=series&id=${this.show.tvdb}`
            break
          case 'imdb':
            url = `http://www.imdb.com/title/${this.show.imdb}/episodes`
            break
          default:
            if (type instanceof Link) {
              url = type.url
            } else {
              return false
            }
        }

        this.$store.dispatch(types.ACTIONS.OPEN_LINK, url)
      },
      /**
       * Load the show
       * @param {Route} route The current route
       */
      loadShow (route) {
        this.$store.dispatch(types.show.ACTIONS.LOAD_SHOW, route.params.id)
          .then((show) => {
            console.log('Loading show', show)
            this.isLoading = false
            this.$store.commit(types.MUTATIONS.ADD_HISTORY, {
              show: show,
              route: route,
            })

            // Load links from DB
            if (show.in_account) {
              this.loadLinks(show)
            }
          })
          .catch((response) => {
            if (response.data && response.data.errors && response.data.errors[0].code === 4001) {
              this.isLoading = false
              this.notFound = true
            }
          })
      },
      /**
       * Load links from DB
       * @param {Show} show
       */
      loadLinks (show) {
        Link.getLinks(show._id).then((links) => {
          this.links = links
        })
      },
    },
    mounted () {
      console.info('[VUE] Mount ShowDetails.vue')
    },
    beforeRouteEnter (to, from, next) {
      next(vm => {
        vm.$store.commit(types.show.MUTATIONS.SET_SHOW, false)
        vm.loadShow(to)
      })
    },
    beforeRouteUpdate (to, from, next) {
      if (!this.show || this.show._id !== to.params.id) {
        this.$store.commit(types.show.MUTATIONS.SET_SHOW, false)
        this.loadShow(to)
      }
      next()
    },
    destroyed () {
      this.$store.commit(types.show.MUTATIONS.SET_SHOW, false)
      this.$store.commit(types.show.MUTATIONS.SET_CHARACTERS, [])
      this.$store.commit(types.show.MUTATIONS.SET_SIMILARS, [])
      this.$store.commit(types.show.MUTATIONS.SET_COMMENTS, [])
    },
  }
</script>

<style lang="scss">
  @import "../assets/scss/vars";
  .header {
    position: relative;
    display: flex;
    align-items: flex-end;
    min-height: 350px;
    text-align: center;
    background-position: top;
    background-size: cover;
    &:after {
      content: "";
      display: block;
      z-index: 1;
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background-image: linear-gradient(-180deg,transparent 0%,rgba(0,0,0,0.2) 51%,rgba(0,0,0,0.8) 100%);
    }

    h1 {
      z-index: 3;
      margin-left: 15px;
      text-shadow: 2px 2px #000;
      font-size: 30px;
      font-weight: 400;
      color: #ffffff;
      .date {
        font-size: 0.7em;
        font-weight: normal;
        font-style: italic;
        color: $navColor;
      }
      .fa-circle {
        font-size: 10px;
        vertical-align: middle;
        text-shadow: none;
      }
    }
  }
  .body {
    margin: 10px;
    clear: both;
  }
  .btn-delete-show {
    color: Tomato;
  }
</style>
