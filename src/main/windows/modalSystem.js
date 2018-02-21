import { app, BrowserWindow } from 'electron'

export default {
  windows: {},
  parent: null,

  init (parentWindow) {
    this.parent = parentWindow
  },

  open (name, url, options) {
    if (this.windows[name]) {
      return this.windows[name].show()
    }

    options = Object.assign({}, {
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
    }, options)

    const win = this.windows[name] = new BrowserWindow(options)
    win.loadURL(`${global.winURL}/modal.html#${url}`, {
      userAgent: global.userAgent,
    })
    win.setMenu(null)
    win.once('ready-to-show', () => { win.show() })
    win.once('closed', () => { delete this.windows[name] })
  },
}

function getIconPath () {
  return process.platform === 'win32'
    ? __static + '/icons/icon.ico'
    : __static + '/icons/icon.png'
}
