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
    import { remote, ipcRenderer } from 'electron'

    import { types, localStore } from '../store'

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
            remote.diaconsole.showErrorBox(remote.app.getName(), error.text)
            this.password = ''
            document.getElementById('password').focus()
          })
        },
        forgot () {
          // Open modal
          ipcRenderer.send('open-modal', 'forgot', `/forgot`, {
            title: 'FeedSeries',
            width: 450,
            height: 230,
            resizable: true,
          })

          // When close modal => remove IPC listener
          ipcRenderer.once('modal-close', (event, modalName) => {
            if (modalName === 'forgot') {
              ipcRenderer.removeAllListeners('forgot-modal')
            }
          })

          // Receive data from modal
          ipcRenderer.on('forgot-modal', (event, payload) => {
            console.log('[IPC Parent] Receive', payload)
            let txtNotif
            switch (payload.action) {
              case 'notif':
                txtNotif = payload.error
                break
              case 'login':
                this.login = payload.login
                document.getElementById('password').focus()
                txtNotif = 'E-mail envoyé avec succès !'
                break
              default:
                return false
            }

            /* eslint-disable no-new */
            new window.Notification('FeedSeries', {
              body: txtNotif,
              icon: localStore.getIconPath(true),
            })
          })
        },
      },
      mounted () {
        console.info('[VUE] Mount LoginModal.vue')
      },
    }
</script>
