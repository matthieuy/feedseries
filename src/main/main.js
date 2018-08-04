/**
 * Common file for dev and prod environment
 */
import {app, BrowserWindow, globalShortcut, ipcMain} from 'electron'
import log from 'electron-log'
import Updater from './system/update'
import localStore from '../renderer/store/local'

let mainWindow, systray
let protocolName = 'feedseries'

app.setAppUserModelId('com.matthieuy.feedseries')
app.setAsDefaultProtocolClient(protocolName)

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
const isNotSingleInstance = app.makeSingleInstance((argv) => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore()
    }
    mainWindow.show()
    mainWindow.focus()
    mainWindow.loadURL(getUrl(argv), {
      userAgent: global.userAgent,
    })
  }
})

// Quit double instance
if (isNotSingleInstance) {
  log.info('Multi instance : close app', process.argv)
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
  mainWindow.loadURL(getUrl(process.argv), {
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

  ipcMain.on('update-icon', () => {
    mainWindow.setIcon(localStore.getIconPath())
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

function getUrl (argv) {
  let url = global.winURL + '/index.html'
  if (argv && argv.length > 1 && process.env.NODE_ENV !== 'development' && argv[1].indexOf(protocolName + '://') === 0) {
    url += '#/' + argv[1].replace(protocolName + '://', '')
  } else if (localStore.get(localStore.key.ROUTE.SAVE, false)) {
    url += '#' + localStore.get(localStore.key.ROUTE.LAST)
  }

  log.info('Load URL :', url)
  return url
}
