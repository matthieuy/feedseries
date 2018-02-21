<template>
  <context-menu ref="ctx" @ctx-open="onOpen">
    <li class="ctx-header">{{ show.title }}</li>
    <li class="ctx-divider"></li>
    <li class="ctx-item" v-show="!show.in_account" @click="add()"><i class="fa fa-plus-circle"></i> Ajouter la série</li>
    <li class="ctx-item" v-show="show.in_account && !show.isArchived" @click="archive()"><i class="fa fa-archive"></i> Archiver la série</li>
    <li class="ctx-item" v-show="show.in_account && show.isArchived" @click="unarchive()"><i class="fa fa-archive"></i> Sortir des archives</li>
    <li class="ctx-divider"></li>
    <li class="ctx-item" @click="gotoShow(show)"><i class="fa fa-id-card"></i> Fiche de la série</li>

    <li v-for="link in links" @click="openLink(link)" class="ctx-item">
      <img :src="link.icon" width="16" height="16" onerror="this.src='static/links/none.png'"> {{ link.name }}
    </li>
    <li class="ctx-item" @click="openBS(show)"><img src="static/links/bs.png"> Voir la série sur BS</li>
  </context-menu>
</template>

<script>
  import { types } from '../../store'
  import { Show, Link } from '../../db'

  export default {
    data () {
      return {
        show: new Show(),
        links: [],
      }
    },
    methods: {
      /**
       * Add the show to the account
       */
      add () {
        this.$store.dispatch(types.shows.ACTIONS.ADD, this.show)
      },
      /**
       * Archive the show
       */
      archive () {
        this.$store.dispatch(types.shows.ACTIONS.ARCHIVE, this.show)
      },
      /**
       * Unarchive the show
       */
      unarchive () {
        this.$store.dispatch(types.shows.ACTIONS.UNARCHIVE, this.show)
      },
      /**
       * Open show on BS (external link)
       */
      openBS (show) {
        if (show.constructor.name !== 'Show') {
          show.typeObj = 'Show'
        }
        this.$store.dispatch(types.ACTIONS.OPEN_LINK, show)
      },
      /**
       * Open link
       * @param {Link} link
       */
      openLink (link) {
        this.$store.dispatch(types.ACTIONS.OPEN_LINK, link.url)
      },
      /**
       * Go to the show page
       * @param show
       */
      gotoShow (show) {
        this.$router.push({name: 'show', params: {id: show._id}})
      },
      /**
       * On open context menu
       * @param {Show} show
       */
      onOpen (show) {
        console.info('[CONTEXT]', show)
        this.show = show

        // Load links
        Link.getLinks(show).then((links) => {
          this.links = links
        })

        // Close other context-menu
        let parentRef = this.$parent.$refs
        let thisTag = this.$options._componentTag
        for (let i in parentRef) {
          if (thisTag !== this.$parent.$refs[i].$options._componentTag) {
            this.$parent.$refs[i].$refs.ctx.ctxVisible = false
          }
        }
      },
    },
  }
</script>
