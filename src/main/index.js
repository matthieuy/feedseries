'use strict'

import { app, BrowserWindow, ipcMain } from 'electron'

import localStore from '../renderer/store/local'
import SplashScreen from './system/splashscreen'
import systray from './system/systray'
import mainMenu from './system/menu'
import updater from './system/update'

let mainWindow
let winURL, splashURL

/*************************
 * Environment variables *
 *************************/
let userAgent = 'FeedSeries'
if (process.env.NODE_ENV === 'development') {
  userAgent += ' (dev)'
  winURL = 'http://localhost:9080'
  splashURL = 'http://localhost:9080/static/splash.html'
} else {
  userAgent += ' v' + app.getVersion()
  winURL = `file://${__dirname}/index.html`
  splashURL = `file://${global.__static}/splash.html`
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

/*************
 * Listeners *
 *************/
app.on('ready', () => {
  // Splashscreen
  SplashScreen.init(splashURL, __static)
})

ipcMain.on('splashscreen-display', () => {
  createWindow()
})

// All windows closed => exit (except macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin' && app.isQuiting) {
    systray.destroy()
    app.quit()
  }
})

// on activate => create the main window if undefined
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

// App full loaded
ipcMain.on('app-ready', () => {
  if (mainWindow) {
    mainWindow.show()
  }

  // Create systray
  systray.init()

  // Check update
  updater.init(mainWindow)
  if (process.env.NODE_ENV !== 'development') {
    updater.check(false)
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
  systray.destroy()
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
    icon: __static + '/icons/128x128.png',
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
  let mainWindowURL = localStore.get(localStore.key.ROUTE.SAVE, false) ? winURL + '#' + localStore.get(localStore.key.ROUTE.LAST) : winURL
  mainWindow.loadURL(mainWindowURL, {
    userAgent: userAgent,
  })
  mainMenu.init(mainWindow)

  // Close window
  mainWindow.on('closed', () => {
    systray.destroy()
    mainWindow = null
  })
  mainWindow.on('close', (event) => {
    if (!app.isQuiting && localStore.get(localStore.key.SYSTRAY, true)) {
      event.preventDefault()
      mainWindow.hide()
    }
    return false
  })
}

// Catch exception
process.on('uncaughtException', function (e) {
  console.error('[EXCEPTION]', e)
})
