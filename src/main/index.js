'use strict'

import { app, BrowserWindow, ipcMain } from 'electron'
import log from 'electron-log'

import Updater from './system/update'

let mainWindow, systray
let userAgent = 'FeedSeries'
app.setAppUserModelId('org.matthieuy.feedseries')

/*************************
 * Environment variables *
 *************************/
if (process.env.NODE_ENV === 'development') {
  userAgent += ' (dev)'
  global.winURL = 'http://localhost:9080'
  log.debug('Environment : dev')
} else {
  log.transports.console.level = 'info'
  log.transports.file.level = 'info'
  userAgent += ' v' + app.getVersion()
  global.winURL = `file://${__dirname}`
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
  log.debug('Environment : prod')
}

// Params
if (process.argv.length) {
  log.debug('Start with params : ', process.argv)
}
let hiddenStart = (process.argv.indexOf('--hidden') > -1)

/*************
 * Listeners *
 *************/
app.on('ready', () => {
  // Splashscreen (if isn't silent start)
  if (!hiddenStart) {
    let SplashScreen = require('./system/splashscreen').default
    SplashScreen.init(hiddenStart)
    ipcMain.on('splashscreen-display', () => {
      createWindow()
    })
  } else {
    createWindow()
  }
})

// All windows closed => exit (except macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin' && app.isQuiting) {
    if (systray) {
      systray.destroy()
    }
    app.quit()
  }
})

// on activate => create the main window if undefined
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/*******************
 * Single instance *
 *******************/
// Singleton instance
const isNotSingleInstance = app.makeSingleInstance(() => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore()
    }
    mainWindow.show()
    mainWindow.focus()
  }
})

// Quit double instance
if (isNotSingleInstance) {
  log.error('Multi instance : close app')
  app.isQuiting = true
  if (systray) {
    systray.destroy()
  }
  app.quit()
}

/**********************
 * Create main window *
 **********************/
function createWindow () {
  mainWindow = new BrowserWindow({
    height: 600,
    minWidth: 850,
    minHeight: 500,
    useContentSize: true,
    icon: (process.platform === 'win32') ? __static + '/icons/icon.ico' : __static + '/icons/icon.png',
    center: true,
    title: app.getName(),
    backgroundColor: '#36393E',
    fullscreenable: false,
    show: false,
    width: 1000,
    webPreferences: {
      devTools: true,
    },
  })

  // Load main window
  let localStore = require('../renderer/store/local').default
  let mainWindowURL = localStore.get(localStore.key.ROUTE.SAVE, false) ? global.winURL + '/index.html#' + localStore.get(localStore.key.ROUTE.LAST) : global.winURL + '/index.html'
  mainWindow.loadURL(mainWindowURL, {
    userAgent: userAgent,
  })

  // Main menu
  let mainMenu = require('./system/menu').default
  mainMenu.init(mainWindow)

  // Close window
  mainWindow.on('closed', () => {
    if (systray) {
      systray.destroy()
    }
    mainWindow = null
  })
  mainWindow.on('close', (event) => {
    if (!app.isQuiting && localStore.get(localStore.key.SYSTRAY, true)) {
      event.preventDefault()
      mainWindow.hide()
    }
    return false
  })

  // App full loaded
  ipcMain.on('app-ready', () => {
    log.debug('App is ready')
    // Create systray
    systray = require('./system/systray').default
    systray.init(mainWindow)

    // Show app
    if (mainWindow && !hiddenStart) {
      mainWindow.show()
    }

    // Check update
    Updater.init(mainWindow)
    if (process.env.NODE_ENV !== 'development') {
      Updater.check(false)
    }
  })
}

// Catch exception
process.on('uncaughtException', function (e) {
  log.error('[EXCEPTION]', e)
})
