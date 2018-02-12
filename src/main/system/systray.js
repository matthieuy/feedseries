/**
 * Systray menu
 * @process main
 */
'use strict'

import { app, BrowserWindow, Menu, Tray } from 'electron'

const template = [
  {
    label: 'Ouvrir',
    click () {
      let mainWindow = BrowserWindow.fromId(2)
      mainWindow.show()
    },
  },
  {
    label: 'Quitter',
    click () {
      app.isQuiting = true
      app.quit()
    },
  },
]

export default {
  tray: null,
  contextMenu: null,
  mainWindow: null,
  /**
   * Init : Create systray
   */
  init (mainWindow) {
    this.mainWindow = mainWindow
    this.tray = new Tray(`${__static}/icons/128x128.png`)
    this.contextMenu = Menu.buildFromTemplate(template)

    // Left click : show mainWindow
    this.tray.on('click', () => {
      this.mainWindow.show()
    })

    this.update()
  },
  /**
   * Destroy the systray
   */
  destroy () {
    if (this.tray && !this.tray.isDestroyed()) {
      this.tray.destroy()
      this.tray = null
    }
  },
  /**
   * Update the systray menu (linux)
   */
  update () {
    this.tray.setContextMenu(this.contextMenu)
  },
}
