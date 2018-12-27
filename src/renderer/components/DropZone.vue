<template>
  <div class="dropzone" v-show="showDrop || isSearching || episode.id">
    <div class="drop-content" v-show="showDrop">
      <div id="dropzone" class="text">Déposez le fichier ici</div>
    </div>
    <div class="drop-content" v-show="isSearching">
      <div class="text ellipse-loading">Recherche en cours</div>
    </div>
    <div class="result-file" v-show="episode.id">
      <h1>{{ episode.show_title }}</h1>
      <img :src="episode.show_img" v-if="episode.show_img" width="100" alt="">
      <div class="name">{{ episode.code}} - {{ episode.title}}</div>
      <div>{{ episode.filename }}</div>
      <div>
        <button class="btn btn-nav" @click="gotoShow()"><i class="fa fa-id-card"></i> Fiche de la série</button>
        <button class="btn btn-nav" @click="addShow()" v-show="!episode.in_account"><i class="fa fa-plus-circle"></i> Ajouter la série</button>
        <button class="btn btn-nav" @click="markDL()" v-show="episode.in_account && !episode.isDownloaded"><i class="fa fa-download"></i> Marquer "récupéré"</button>
        <button class="btn btn-nav" @click="markView()" v-show="episode.in_account && !episode.isSeen"><i class="fa fa-eye"></i> Marquer "vu"</button>
        <button class="btn btn-nav" @click="close()"><i class="fa fa-times-circle"></i> Annuler</button>
      </div>
    </div>
  </div>
</template>

<script>
  import { remote } from 'electron'

  import { types } from '../store'
  import api from '../api'

  export default {
    data () {
      return {
        episode: {},
        showDrop: false,
        isSearching: false,
      }
    },
    methods: {
      dragFiles (files) {
        console.log('[DRAG] Files : ', files)

        // Only one file
        if (files.length > 1) {
          remote.dialog.showErrorBox(remote.app.getName(), 'Merci de déposer un seul fichier à la fois !')
          console.error('[DRAG] Plusieurs fichiers !')
          return this.close()
        }

        // Get file
        let file = files.item(0)
        this.showDrop = false

        // Search
        this.isSearching = true
        api.episodes.scraper(file.name).then((episode) => {
          this.isSearching = false
          this.episode = {
            id: episode.id,
            code: episode.code,
            title: episode.title,
            filename: file.name,
            show_id: episode.show.id,
            show_title: episode.show.title,
            show_img: api.shows.getShowImgUrl(episode.show.id, 100, 147),
            in_account: episode.show.in_account,
            isDownloaded: episode.user.downloaded,
            isSeen: episode.user.seen,
          }
          window.removeEventListener('keydown', this.escapeListener)
          window.addEventListener('keydown', this.escapeListener)
        }).catch((error) => {
          this.isSearching = false
          if (error.code === 4001) {
            remote.dialog.showErrorBox(remote.app.getName(), error.text)
            this.close()
          }
        })
      },
      gotoShow () {
        this.$router.push({ name: 'show', params: { id: this.episode.show_id } })
        this.close()
      },
      addShow () {
        this.$store.dispatch(types.shows.ACTIONS.ADD, { _id: this.episode.show_id }).then(() => {
          this.close()
        })
      },
      markDL () {
        this.$store.dispatch(types.episodes.ACTIONS.MARK_DL, {
          episode: {
            _id: this.episode.id,
          },
          isDL: true,
        }).then(() => {
          this.close()
        })
      },
      markView () {
        this.$store.dispatch(types.episodes.ACTIONS.MARK_VIEW, {
          episode: { _id: this.episode.id },
          isView: true,
        }).then(() => {
          this.close()
        })
      },
      close () {
        this.showDrop = false
        this.isSearching = false
        this.episode = {}
        window.removeEventListener('keydown', this.escapeListener)
        return false
      },
      escapeListener (event) {
        if (event.which === 27) {
          this.close()
        }
      },
    },
    mounted () {
      console.log('[VUE] Mount DropZone.vue')

      // Get HTML elements
      let appDiv = document.getElementById('app')
      let holderDiv = document.getElementById('dropzone')

      // HTML5 drag'n drop events
      appDiv.ondragover = () => {
        if (!this.showDrop) {
          this.showDrop = true
        }
        return false
      }
      holderDiv.ondragleave = () => {
        if (this.showDrop) {
          this.showDrop = false
        }
        return false
      }
      holderDiv.ondragend = () => false
      holderDiv.ondrop = (event) => {
        event.preventDefault()
        this.dragFiles(event.dataTransfer.files)
        return false
      }
    },
  }
</script>

<style lang="scss">
.dropzone {
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background-color: #202329;
  z-index: 4;
  opacity: 0.9;
  .drop-content {
    height: 100%;
    display: flex;
    justify-content: center;
    flex-direction: column;
    padding: 10px;
  }
  .text {
    display: flex;
    justify-content: center;
    flex-direction: column;
    text-align: center;
    font-size: 4em;
  }
  #dropzone {
    border: 5px dashed #9DA5B4;
    border-radius: 20px;
    width: 100%;
    height: 95%;
  }
  .result-file {
    text-align: center;
    h1 {
      color: #ffffff;
      margin-bottom: 0;
    }
    .name {
      font-style: italic;
    }
    .btn-nav {
      cursor: pointer;
    }
  }
}
</style>
