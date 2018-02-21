import { app, Menu, shell } from 'electron'

import modalSystem from '../windows/modalSystem'
import Updater from './update'
import { localStore } from '../../renderer/store'

let template = [
  {
    label: 'Fichier',
    submenu: [
      {
        label: 'Quitter',
        accelerator: 'CommandOrControl+W',
        click () {
          app.isQuiting = true
          app.quit()
        },
      },
    ],
  },
  {
    label: 'Affichage',
    submenu: [
      { label: 'Rafraichir', role: 'reload', accelerator: 'F5' },
      {
        id: 'fullscreen',
        label: 'Plein écran',
        type: 'checkbox',
        accelerator: 'F11',
        click (menuItem, browserWindow) {
          if (browserWindow.isMaximized()) {
            browserWindow.unmaximize()
            menuItem.checked = false
          } else {
            browserWindow.maximize()
            menuItem.checked = true
          }
        },
      },
      {
        label: 'Toujours au-dessus',
        type: 'checkbox',
        click (menuItem, browserWindow) {
          let onTop = browserWindow.isAlwaysOnTop()
          browserWindow.setAlwaysOnTop(!onTop)
          menuItem.checked = !onTop
        },
      },
      {
        id: 'devtools',
        label: 'DevTools',
        accelerator: 'F12',
        type: 'checkbox',
        click (menuItem, browserWindow) {
          browserWindow.webContents.toggleDevTools()
        },
      },
    ],
  },
  {
    label: '?',
    submenu: [
      {
        label: 'Allez sur BetaSeries',
        click () {
          shell.openExternal('https://www.betaseries.com/')
        },
      },
      {
        label: 'Vérifier les mises à jour',
        click (menuItem, browserWindow) {
          Updater.init(browserWindow)
          Updater.check(true)
        },
      },
      {
        label: 'À propos',
        click (menuItem, browserWindow) {
          modalSystem.open('about', '/about', {
            title: 'À propos',
            width: 300,
            height: 350,
          })
        },
      },
    ],
  },
]

export default {
  init (win) {
    // Create menu
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)

    // Fullscreen
    let fullscreenItem = menu.getMenuItemById('fullscreen')
    fullscreenItem.checked = win.isMaximized()
    win.on('resize', (event) => { fullscreenItem.checked = event.sender.isMaximized() })
    win.on('unmaximize', () => { fullscreenItem.checked = false })

    // DevTools
    let devToolsItem = menu.getMenuItemById('devtools')
    let webContents = win.webContents
    devToolsItem.checked = webContents.isDevToolsOpened()
    webContents.on('devtools-opened', () => {
      devToolsItem.checked = true
      localStore.set(localStore.key.DEVTOOLS, true)
    })
    webContents.on('devtools-closed', () => {
      devToolsItem.checked = false
      localStore.set(localStore.key.DEVTOOLS, false)
    })
    if (localStore.get(localStore.key.DEVTOOLS, false)) {
      webContents.openDevTools()
    }
  },
}
