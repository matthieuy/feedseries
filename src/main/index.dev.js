/**
 * This file is used specifically and only for development.
 */

import { app } from 'electron'
import log from 'electron-log'

// Set environment for development
process.env.NODE_ENV = 'development'
app.isQuiting = true
log.transports.console.level = 'debug'
log.transports.file.level = 'debug'
global.winURL = 'http://localhost:9080'
global.userAgent = 'FeedSeries (dev)'
log.debug('Environment : dev')

// Use the same path as prod
app.setPath('userData', require('path').join(app.getPath('appData'), 'FeedSeries'))

// Install `vue-devtools`
app.on('ready', () => {
  let installExtension = require('electron-devtools-installer')
  installExtension.default(installExtension.VUEJS_DEVTOOLS.id)
    .catch(err => {
      log.error('Unable to install `vue-devtools`: \n', err)
    })
})

// Require `main` process to boot app
require('./main')
