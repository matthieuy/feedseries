import { app, BrowserWindow, ipcMain } from 'electron'

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

    // Default options
    options = Object.assign({
      title: app.getName(),
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
      webPreferences: {
        devTools: true,
      },
    }, options)

    const win = this.windows[name] = new BrowserWindow(options)
    win.loadURL(`${global.winURL}/modal.html#${url}`, {
      userAgent: global.userAgent,
    })
    win.setMenu(null)
    win.once('ready-to-show', () => { win.show() })
    win.once('closed', () => { delete this.windows[name] })
    if (process.env.NODE_ENV === 'development') {
      win.openDevTools()
    }
  },
}

function getIconPath () {
  return process.platform === 'win32'
    ? __static + '/icons/icon.ico'
    : __static + '/icons/icon.png'
}
