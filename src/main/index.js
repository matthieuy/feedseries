/**
 * This file is used specifically and only for production.
 */
'use strict'

import { app } from 'electron'
import log from 'electron-log'
let path = require('path')

/********************
 * Portable version *
 ********************/
if (process.env.PORTABLE_EXECUTABLE_DIR) {
  let portablePath = path.join(process.env.PORTABLE_EXECUTABLE_DIR, 'feedseries_data')
  app.setPath('userData', path.join(portablePath, 'userdata'))
  app.setPath('temp', path.join(portablePath, 'tmp'))
  app.setPath('logs', path.join(portablePath, 'logs'))
  log.transports.file.file = path.join(portablePath, 'log.log')
  log.debug('Portable version')
  app.isQuiting = true
}

/*************************
 * Environment variables *
 *************************/
log.transports.console.level = 'info'
log.transports.file.level = 'info'
global.userAgent = `FeedSeries v${app.getVersion()}`
global.winURL = `file://${__dirname}`
global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\')
log.debug('Environment : prod', global.userAgent)

/******************
 * CLI Parameters *
 ******************/
if (process.argv.length > 1 && process.env.NODE_ENV !== 'development') {
  log.info('Start with params : ', process.argv)
}
global.silentStart = (process.argv.indexOf('--hidden') > -1) // Start without display windows

require('./main')
