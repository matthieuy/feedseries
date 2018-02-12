import { app, BrowserWindow, ipcMain } from 'electron'

export default {
  splashWindow: null,
  splashURL: '',
  staticPath: '',

  /**
   * Init the splashscreen
   */
  init (splashURL, staticPath) {
    // Init var
    this.staticPath = staticPath
    this.splashURL = splashURL

    // Create
    this.create()

    // Hide splashScreen when app is ready
    ipcMain.on('app-ready', () => {
      if (this.splashWindow) {
        this.splashWindow.destroy()
        this.splashWindow = null
      }
    })

    return this
  },

  /**
   * Create the window and load content
   */
  create () {
    this.splashWindow = new BrowserWindow({
      height: 210,
      width: 330,
      center: true,
      frame: false,
      title: app.getName(),
      backgroundColor: '#36393E',
      movable: false,
      skipTaskbar: true,
      icon: this.staticPath + '/icons/128x128.png',
      alwaysOnTop: true,
      show: false,
    })
    this.splashWindow.loadURL(this.splashURL)
    this.splashWindow.on('ready-to-show', () => {
      this.splashWindow.show()
      ipcMain.emit('splashscreen-display')
    })

    return this
  },
}
