<template>
    <div v-show="!isLogged">
        <div class="login-bg"></div>
        <div class="login-modal">
            <h1>Se connecter</h1>
            <form onsubmit="return false;">
                <div class="form-group">
                    <label for="login">Identifiant :</label>
                    <input id="login" class="form-control" placeholder="Identifiant" v-model="login" autofocus>
                </div>
                <div class="form-group">
                    <label for="password">Mot de passe :</label>
                    <input id="password" type="password" class="form-control" placeholder="Mot de passe" v-model="password">
                </div>

                <div class="buttons">
                    <button class="btn btn-large btn-primary" @click="connect()" :class="{ disabled: !isFormValid }" :disabled="!isFormValid">
                        <i :class="{'fa fa-spin fa-spinner fa-pull-left': isLoading}"></i> Se connecter
                    </button>
                    <button class="btn btn-large btn-positive" @click="signup()">
                        Inscription
                    </button>
                    <button class="btn btn-large btn-warning" @click="forgot()">
                        Mot de passe oublié
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex'
    import { remote } from 'electron'

    import { types, localStore } from '../store'
    import ModalRenderer from '../tools/ModalRenderer'

    let modalForgot
    let modalSignup

    export default {
      data () {
        return {
          isLoading: false,
          login: localStore.get(localStore.key.LOGIN, ''),
          password: '',
        }
      },
      computed: {
        ...mapState([
          'isLogged',
        ]),
        isFormValid () {
          return this.login.length > 0 && this.password.length > 0 && !this.isLoading
        },
      },
      methods: {
        /**
         * Connect
         * @returns {boolean}
         */
        connect () {
          if (!this.isFormValid) {
            return false
          }
          this.isLoading = true

          // Login request
          this.$store.dispatch(types.ACTIONS.LOGIN, {
            login: this.login,
            password: this.password,
          }).then((response) => { // OK
            localStore.set(localStore.key.LOGIN, response.login)
            this.password = ''
            this.isLoading = false
            this.$store.dispatch(types.ACTIONS.ON_LOGIN).then(() => {})
          }).catch((error) => { // NOK
            this.isLoading = false
            console.log(error)
            remote.dialog.showErrorBox(remote.app.getName(), error.text)
            this.password = ''
            document.getElementById('password').focus()
          })
        },
        /**
         * Forgot password
         */
        forgot () {
          // Create modal IPC
          if (!modalForgot) {
            modalForgot = new ModalRenderer('forgot')
            modalForgot
              .on('notif', (txt) => {
                this.addNotification(txt)
              })
              .on('login', (login) => {
                this.login = login
                document.getElementById('password').focus()
                this.addNotification('E-mail envoyé avec succès !')
              })
          }

          // Open modal
          modalForgot.openModal('/forgot', {
            title: 'FeedSeries',
            width: 450,
            height: 230,
          })
        },
        /**
         * Signup
         */
        signup () {
          // Create modal
          if (!modalSignup) {
            modalSignup = new ModalRenderer('signup')
            modalSignup.on('signup', (payload) => {
              localStore.set(localStore.key.LOGIN, payload.login)
              localStore.set(localStore.key.ID_USER, payload.id)
              this.$store.commit(types.MUTATIONS.LOGIN, payload.token)
              this.$store.dispatch(types.ACTIONS.ON_LOGIN).then(() => {})
              this.addNotification(`Vous êtes maintenant inscrit avec l'identifiant "${payload.login}"`)
            })
          }

          // Open modal
          modalSignup.openModal('/signup', {
            title: 'FeedSeries',
            width: 450,
            height: 380,
          })
        },
        /**
         * Add a notification
         * @param {String} txt
         */
        addNotification (txt) {
          /* eslint-disable no-new */
          new window.Notification('FeedSeries', {
            body: txt,
            icon: localStore.getIconPath(true),
          })
        },
      },
      watch: {
        isLogged (value) {
          if (!value && this.$route.name !== 'homepage') {
            this.$router.push({name: 'homepage'})
          }
        },
      },
      mounted () {
        console.info('[VUE] Mount LoginModal.vue')
      },
    }
</script>
