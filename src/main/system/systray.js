/**
 * Systray menu
 * @process main
 */
'use strict'

import { app, BrowserWindow, ipcMain, Menu, Tray } from 'electron'

const template = [
  {
    label: 'Ouvrir',
    click () {
      let mainWindow = BrowserWindow.fromId(2)
      mainWindow.show()
    },
  },
  {
    label: 'Vérifier les mises à jour',
    click () {
      ipcMain.emit('check-update', true)
    },
  },
  {
    type: 'separator',
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
    if (this.tray === null) {
      this.mainWindow = mainWindow
      this.tray = new Tray(this.getIconPath())
      this.contextMenu = Menu.buildFromTemplate(template)
      this.tray.setToolTip(app.getName())

      // Left click : show mainWindow
      this.tray.on('click', () => {
        this.mainWindow.show()
      })

      ipcMain.on('update-tray', () => {
        this.tray.setImage(this.getIconPath())
        this.update()
      })
    }

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
  /**
   * Get the systray icon path
   * @returns {string}
   */
  getIconPath () {
    let localStore = require('../../renderer/store/local').default
    let whiteIcon = (localStore.get(localStore.key.WHITE_ICON, true)) ? '-w' : '-b'
    return `${__static}/icons/128x128${whiteIcon}.png`
  },
}
