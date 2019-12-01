import { app, BrowserWindow, ipcMain, globalShortcut } from 'electron'
import { localStore } from '../../renderer/store'
import log from 'electron-log'

export default {
  windows: {},
  parent: null,

  init (parentWindow) {
    this.parent = parentWindow

    ipcMain.on('open-modal', (event, name, url, options) => {
      this.open(name, url, options)
    })
  },

  open (name, url, options) {
    if (this.windows[name]) {
      return this.windows[name].show()
    }
    if (!url) {
      return false
    }

    // Default options
    options = Object.assign({
      title: app.name,
      backgroundColor: '#181A1F',
      useContentSize: true,
      center: true,
      resizable: false,
      minimizable: false,
      maximizable: false,
      fullscreenable: false,
      icon: localStore.getIconPath(),
      skipTaskbar: true,
      show: false,
      frame: true,
      parent: this.parent,
      modal: true,
      webPreferences: {
        devTools: true,
        plugins: false,
        webgl: false,
        webaudio: false,
        nodeIntegration: true,
      },
    }, options)

    // Create window
    const win = this.windows[name] = new BrowserWindow(options)
    win.loadURL(`${global.winURL}/modal.html#${url}`, {
      userAgent: global.userAgent,
    })
    win.setMenu(null)
    win.setMenuBarVisibility(false)
    win.once('ready-to-show', () => {
      log.debug('[MODAL] Open', name)
      win.on('unresponsive', () => { log.error('[MODAL UNRESPONSIVE]', name) })
      win.on('responsive', () => { log.error('[MODAL RESPONSIVE]', name) })
      win.show()
    })

    // Close event
    if (!globalShortcut.isRegistered('Escape') && (typeof options.escape === 'undefined' || options.escape)) {
      globalShortcut.register('Escape', () => {
        win.close()
      })
    }

    win.once('close', () => {
      log.debug('[MODAL] Close', name)
      this.parent.webContents.send('modal-close', name)
      if (globalShortcut.isRegistered('Escape')) {
        globalShortcut.unregister('Escape')
      }
      win.removeAllListeners('unresponsive')
      win.removeAllListeners('responsive')
    })
    win.once('closed', () => {
      win.destroy()
      delete this.windows[name]
    })
    if (process.env.NODE_ENV === 'development' && localStore.get(localStore.key.DEVTOOLS, false)) {
      win.openDevTools()
    }
  },
}
