/**
 * This file is used specifically and only for development. It installs
 * `electron-debug` & `vue-devtools`. There shouldn't be any need to
 *  modify this file, but it can be used to extend your development
 *  environment.
 */

import { app } from 'electron'
import log from 'electron-log'

// Set environment for development
process.env.NODE_ENV = 'development'
app.isQuiting = true
log.transports.console.level = 'debug'
log.transports.file.level = 'debug'

// Install `vue-devtools`
app.on('ready', () => {
  let installExtension = require('electron-devtools-installer')
  installExtension.default(installExtension.VUEJS_DEVTOOLS)
    .then(() => {
      // Install devtron
      log.debug('Install devtron')
      require('devtron').install()
    })
    .catch(err => {
      log.error('Unable to install `vue-devtools`: \n', err)
    })
})

// Require `main` process to boot app
require('./index')
