<template>
  <context-menu ref="ctx" @ctx-open="onOpen" @ctx-close="onCtxClose" @ctx-cancel="onCtxClose">
    <li class="ctx-header">{{ episode.show.title }} - {{ episode.code }}</li>
    <li class="ctx-divider"></li>
    <li class="ctx-item" v-show="!episode.isSeen && !episode.show.isArchived" @click="markView(episode)"><i class="fa fa-eye"></i> Marquer "vu"</li>
    <li class="ctx-item" v-show="episode.isSeen && !episode.show.isArchived" @click="unmarkView(episode)"><i class="fa fa-eye-slash"></i> Marquer "non-vu"</li>
    <li class="ctx-item" v-show="!episode.isDownloaded && !episode.isSeen" @click="markDL(episode, true)"><i class="fa fa-download"></i> Marquer "récupéré"</li>
    <li class="ctx-item" v-show="episode.isDownloaded && !episode.isSeen" @click="markDL(episode, false)">
      <span class="fa-stack" style="font-size: 9px;">
        <i class="fa fa-download fa-stack-1x" style="font-size: 12px;"></i>
        <i class="fa fa-ban fa-stack-2x" style="opacity: 0.7;"></i>
      </span> Marquer "non récupéré"
    </li>
    <li class="ctx-divider"></li>
    <li class="ctx-item" v-show="!hideShow && !episode.show.isArchived" @click="archive(episode.show)"><i class="fa fa-archive"></i> Archiver la série</li>
    <li class="ctx-divider" v-show="!hideShow"></li>
    <li v-for="link in links" @click="openWeb(link.url)" class="ctx-item" v-show="!hideShow">
      <img :src="link.icon" width="16" height="16" onerror="this.src='static/empty.png'"> {{ link.name }}
    </li>
    <li class="ctx-item" v-show="!hideShow" @click="gotoShow(episode.show)"><i class="fa fa-id-card"></i> Fiche de la série</li>
    <li class="ctx-item" v-show="episode.youtube" @click="openWeb('https://www.youtube-nocookie.com/embed/' + episode.youtube)"><img src="static/links/youtube.png" /> Voir sur YouTube</li>
    <li class="ctx-item" @click="openWeb(episode)"><img src="static/links/bs.png" /> Voir l'épisode sur BS</li>
  </context-menu>
</template>

<script>
  import { types } from '../../store'
  import { Episode, Link } from '../../db'

  export default {
    props: {
      hideShow: { default: false }, // Hide show action
    },
    data () {
      return {
        episode: new Episode(),
        links: [],
      }
    },
    methods: {
      /**
       * Mark episode as view
       * @param {Episode} episode The episode
       */
      markView (episode) {
        this.$store.dispatch(types.episodes.ACTIONS.MARK_VIEW, episode).then((result) => {
          this.episode = result
        })
        this.episode.isSeen = true
      },
      /**
       * Mark episode as no view
       * @param {Episode} episode The episode
       */
      unmarkView (episode) {
        this.$store.dispatch(types.episodes.ACTIONS.UNMARK_VIEW, episode).then((result) => {
          this.episode = result
        })
        this.episode.isSeen = false
      },
      /**
       * Mark episode as DL or not
       * @param {Episode} episode The episode
       * @param {Boolean} isDL is DL or not
       */
      markDL (episode, isDL) {
        this.$store.dispatch(types.episodes.ACTIONS.MARK_DL, {
          episode: episode,
          isDL: isDL,
        }).then((result) => {
          this.episode = result
        })
        this.episode.isDownloaded = isDL
      },
      /**
       * Archive a show
       * @param {Show} show The show
       */
      archive (show) {
        this.$store.dispatch(types.shows.ACTIONS.ARCHIVE, show).then(() => {
          // Update unseen episode from DB
          Episode.getUnseen().then((episodes) => {
            this.$store.commit(types.episodes.MUTATIONS.SET_EPISODES, episodes)
          })
        })
      },
      /**
       * On open context menu
       * @param {Episode} episode The episode selected
       */
      onOpen (episode) {
        console.info('[CONTEXT]', episode)
        this.episode = episode

        // Load links
        if (!this.hideShow) {
          Link.getLinks(episode.show._id).then((links) => {
            this.links = links
          })
        }

        // Close other context-menu
        let parentRef = this.$parent.$refs
        let thisTag = this.$options._componentTag
        for (let i in parentRef) {
          if (thisTag !== this.$parent.$refs[i].$options._componentTag && this.$parent.$refs[i].$refs.ctx) {
            this.$parent.$refs[i].$refs.ctx.ctxVisible = false
          }
        }
        window.addEventListener('keydown', this.escapeListener)
      },
      /**
       * Open show|episode on BS (external link)
       * @param {Episode|Show|String} element The element
       */
      openWeb (element) {
        this.$store.dispatch(types.ACTIONS.OPEN_LINK, element)
      },
      /**
       * Go to the show page
       * @param show
       */
      gotoShow (show) {
        this.$router.push({name: 'show', params: {id: show._id}})
      },
      /**
       * On close ctx : remove listener
       */
      onCtxClose (episode) {
        window.removeEventListener('keydown', this.escapeListener)
        this.$emit('ctx-episode-close', episode)
      },
      /**
       * When press Escape key
       * @param event
       */
      escapeListener (event) {
        if (event.which === 27) {
          this.$refs.ctx.ctxVisible = false
          this.onCtxClose()
        }
      },
    },
  }
</script>
