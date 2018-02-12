/**
 * This file is used specifically and only for development. It installs
 * `electron-debug` & `vue-devtools`. There shouldn't be any need to
 *  modify this file, but it can be used to extend your development
 *  environment.
 */

import { app } from 'electron'

// Set environment for development
process.env.NODE_ENV = 'development'
app.isQuiting = true

// Install `vue-devtools`
app.on('ready', () => {
  let installExtension = require('electron-devtools-installer')
  installExtension.default(installExtension.VUEJS_DEVTOOLS)
    .then(() => {
      // Install devtron
      require('devtron').install()
    })
    .catch(err => {
      console.error('Unable to install `vue-devtools`: \n', err)
    })
})

// Require `main` process to boot app
require('./index')
