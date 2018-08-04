<template>
  <div>
    <div class="forgot">
      <h1>Mot de passe oublié</h1>
      <form onsubmit="return false;">
        <div class="form-group">
          <label for="email">Adresse mail :</label>
          <input id="email" class="form-control" placeholder="Adresse mail ou identifiant" v-model="email" autofocus>
        </div>

        <div class="buttons">
          <button class="btn btn-large btn-primary" :class="{ disabled: !isFormValid }" :disabled="!isFormValid" @click="send()">
            <i :class="{'fa fa-spin fa-spinner fa-pull-left': isLoading}"></i> Renvoyer par mail
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
  import { remote } from 'electron'
  import api from '../../api'

  export default {
    data () {
      return {
        email: '',
        isLoading: false,
      }
    },
    computed: {
      isFormValid () {
        return this.email.length > 3
      },
    },
    methods: {
      send () {
        if (!this.isFormValid) {
          return false
        }
        this.isLoading = true
        let webContents = remote.getCurrentWindow().getParentWindow().webContents

        api.auth.lost(this.email).then((response) => {
          this.isLoading = false
          webContents.send('forgot-modal', {
            action: 'login',
            login: this.email,
          })
          remote.getCurrentWindow().close()
        }).catch((error) => {
          webContents.send('forgot-modal', {
            action: 'notif',
            error,
          })
          this.email = ''
          document.getElementById('email').focus()
          this.isLoading = false
        })
      },
    },
    mounted () {
      console.info('[VUE] Mount Modal/Forgot.vue')
    },
  }
</script>

<style lang="scss">
  $rootFont: '../../';
  @import "../../assets/scss/theme";
  .forgot {
    top: 20px;
  }
</style>
