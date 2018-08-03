/**
 * Common file for dev and prod environment
 */
import {app, BrowserWindow, globalShortcut, ipcMain} from 'electron'
import log from 'electron-log'
import Updater from './system/update'

app.setAppUserModelId(process.execPath)
// app.setAppUserModelId('org.matthieuy.feedseries')
// app.setAsDefaultProtocolClient('feedseries')

let mainWindow, systray

/*************
 * Listeners *
 *************/
app.on('ready', () => {
  // Splashscreen (if isn't silent start)
  if (!global.silentStart) {
    let SplashScreen = require('./windows/splashscreen').default
    SplashScreen.init()
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

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
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
  let localStore = require('../renderer/store/local').default
  mainWindow = new BrowserWindow({
    height: 600,
    minWidth: 850,
    minHeight: 500,
    useContentSize: true,
    icon: localStore.getIconPath(),
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
  console.log('Main : ', global.winURL)
  let mainWindowURL = localStore.get(localStore.key.ROUTE.SAVE, false) ? global.winURL + '/index.html#' + localStore.get(localStore.key.ROUTE.LAST) : global.winURL + '/index.html'
  log.info('Load URL', mainWindowURL)
  mainWindow.loadURL(mainWindowURL, {
    userAgent: global.userAgent,
  })

  // Main menu
  let mainMenu = require('./system/menu').default
  mainMenu.init(mainWindow)

  // Modal
  let modalSystem = require('./windows/modalSystem').default
  modalSystem.init(mainWindow)

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
    if (mainWindow && !global.silentStart) {
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
