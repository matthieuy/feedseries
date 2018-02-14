import { BrowserWindow } from 'electron'
import log from 'electron-log'

export default {
  win: null,
  parent: null,

  init (parentWindow) {
    this.parent = parentWindow
    if (this.win) {
      return this.win.show()
    }
    const win = this.win = new BrowserWindow({
      title: 'À propos',
      backgroundColor: '#181A1F',
      width: 300,
      height: 350,
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

    log.debug('Load about modal')
    win.loadURL(global.winURL + '/modal.html#/about')
    win.setMenu(null)
    win.once('ready-to-show', () => { win.show() })
    win.once('closed', () => { this.win = null })
  },
}

function getIconPath () {
  return process.platform === 'win32'
    ? __static + '/icons/icon.ico'
    : __static + '/icons/icon.png'
}
