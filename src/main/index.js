'use strict'

import { app, BrowserWindow, ipcMain } from 'electron'

import updater from './system/update'

let mainWindow, systray
let userAgent = 'FeedSeries'

/*************************
 * Environment variables *
 *************************/
if (process.env.NODE_ENV === 'development') {
  userAgent += ' (dev)'
  global.winURL = 'http://localhost:9080'
} else {
  userAgent += ' v' + app.getVersion()
  global.winURL = `file://${__dirname}`
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

/*************
 * Listeners *
 *************/
app.on('ready', () => {
  // Splashscreen
  let SplashScreen = require('./system/splashscreen').default
  SplashScreen.init()
})

ipcMain.on('splashscreen-display', () => {
  createWindow()
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
  let mainWindowURL = localStore.get(localStore.key.ROUTE.SAVE, false) ? global.winURL + '/index.html#' + localStore.get(localStore.key.ROUTE.LAST) : global.winURL
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
    // Create systray
    systray = require('./system/systray').default
    systray.init(mainWindow)

    // Show app
    if (mainWindow) {
      mainWindow.show()
    }

    // Check update
    updater.init(mainWindow)
    if (process.env.NODE_ENV !== 'development') {
      updater.check(false)
    }
  })
}

// Catch exception
process.on('uncaughtException', function (e) {
  console.error('[EXCEPTION]', e)
})
