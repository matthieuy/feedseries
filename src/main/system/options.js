import { BrowserWindow, ipcMain } from 'electron'
import log from 'electron-log'

export default {
  win: null,
  parent: null,

  init () {
    if (this.win) {
      return this.win.show()
    }
    const win = this.win = new BrowserWindow({
      title: 'Options',
      backgroundColor: '#181A1F',
      useContentSize: true,
      center: true,
      resizable: false,
      minimizable: false,
      maximizable: false,
      fullscreenable: false,
      icon: getIconPath(),
      skipTaskbar: true,
      show: false,
      frame: true,
      parent: this.parent,
      modal: true,
    })

    log.debug('Load options modal')
    win.loadURL(global.winURL + '/modal.html#/options')
    win.setMenu(null)
    win.once('ready-to-show', () => { win.show() })
    win.once('closed', () => { this.win = null })
  },

  prepareListeners (parentWindow) {
    this.parent = parentWindow
    ipcMain.on('open-options', () => {
      this.init()
    })
  },
}

function getIconPath () {
  return process.platform === 'win32'
    ? __static + '/icons/icon.ico'
    : __static + '/icons/icon.png'
}
