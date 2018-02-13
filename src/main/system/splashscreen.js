import { app, BrowserWindow, ipcMain } from 'electron'

export default {
  win: null,
  url: '',

  /**
   * Init the splashscreen
   */
  init () {
    if (process.env.NODE_ENV === 'development') {
      this.url = 'http://localhost:9080/static/splash.html'
    } else {
      this.url = `file://${global.__static}/splash.html`
    }

    // Create
    this.create()

    // Hide splashScreen when app is ready
    ipcMain.on('app-ready', () => {
      if (this.win) {
        this.win.destroy()
        this.win = null
      }
    })

    return this
  },

  /**
   * Create the window and load content
   */
  create () {
    this.win = new BrowserWindow({
      height: 210,
      width: 330,
      center: true,
      frame: false,
      title: app.getName(),
      backgroundColor: '#36393E',
      movable: false,
      skipTaskbar: true,
      icon: __static + '/icons/128x128.png',
      alwaysOnTop: true,
      show: false,
    })
    this.win.loadURL(this.url)
    this.win.on('ready-to-show', () => {
      this.win.show()
      ipcMain.emit('splashscreen-display')
    })

    return this
  },
}
