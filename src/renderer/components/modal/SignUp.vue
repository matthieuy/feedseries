<template>
  <div>
    <div class="signup">
      <h1>Inscription</h1>
      <form onsubmit="return false;">
        <div class="form-group">
          <label for="login">Pseudo :</label>
          <input id="login" class="form-control" placeholder="Pseudo" v-model="login" autofocus>
          <span v-show="suggestLogin.length">Suggestions :</span> <div class="suggest" v-for="suggest in suggestLogin" @click="login = suggest">{{ suggest }}</div>
        </div>
        <div class="form-group">
          <label for="email">Adresse mail :</label>
          <input id="email" class="form-control" placeholder="Adresse mail" v-model="email">
        </div>
        <div class="form-group">
          <label for="password">Mot de passe :</label>
          <input id="password" type="password" class="form-control" placeholder="Mot de passe" v-model="password">
        </div>

        <div class="buttons">
          <button class="btn btn-large btn-primary" :class="{ disabled: !isFormValid }" :disabled="!isFormValid" @click="signup()">
            <i :class="{'fa fa-spin fa-spinner fa-pull-left': isLoading}"></i> S'inscrire
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
  import { remote } from 'electron'
  import api from '../../api'
  import { localStore } from '../../store'
  import ModalRenderer from '../../tools/ModalRenderer'

  let modal

  export default {
    data () {
      return {
        password: '',
        login: '',
        email: '',
        suggestLogin: [],
        isLoading: false,
      }
    },
    computed: {
      isFormValid () {
        return this.login.length > 2 && this.email.length >= 5 && this.email.indexOf('@') !== -1 && this.password.length >= 5
      },
    },
    methods: {
      signup () {
        if (!this.isFormValid) {
          return false
        }

        this.isLoading = true
        api.auth.signup(this.login, this.email, this.password).then((response) => {
          this.isLoading = false
          modal.sendToParent('signup', response)
          remote.getCurrentWindow().close()
        }).catch((error) => {
          if (error.code === 4004) {
            this.getSuggestLogin()
          }
          /* eslint-disable no-new */
          new window.Notification('FeedSeries', {
            body: error.text,
            icon: localStore.getIconPath(true),
          })
          this.isLoading = false
        })
      },
      getSuggestLogin () {
        if (this.login.length) {
          this.suggestLogin = []
          api.auth.suggestUsername(this.login).then((list) => {
            this.suggestLogin = list
          })
        }
      },
    },
    mounted () {
      console.info('[VUE] Mount Modal/Signup.vue')
      modal = new ModalRenderer('signup')
    },
  }
</script>

<style lang="scss">
  $rootFont: '../../';
  @import "../../assets/scss/theme";
  .signup {
    top: 20px;
    .suggest {
      display: inline-block;
      cursor: pointer;
      background-color: $navColor;
      padding: 1px 5px;
      margin-right: 5px;
      margin-top: 10px;
      border-radius: 8px;
    }
  }
</style>
