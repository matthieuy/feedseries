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
                </div>
            </form>
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex'
    import { remote } from 'electron'

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
      },
      mounted () {
        console.info('[VUE] Mount LoginModal.vue')
      },
    }
</script>
