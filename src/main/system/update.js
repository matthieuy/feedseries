import { app, dialog, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'

import modalSystem from '../windows/modalSystem'
import { localStore } from '../../renderer/store'

class Updater {
  /**
   * Construtor : init variables
   */
  constructor () {
    autoUpdater.autoDownload = false
    autoUpdater.fullChangelog = true
    autoUpdater.allowPrerelease = localStore.get(localStore.key.UPDATE.PRERELEASE, false)
    if (process.env.NODE_ENV === 'development') {
      autoUpdater.updateConfigPath = require('path').join(__dirname, '../../../.electron-vue/dev-app-update.yml')
      autoUpdater.currentVersion = '0.0.1'
    }

    this._init = false
    this._mainWindow = null
    this._byUser = false
    this._percent = 0
    this._webcontent = null
  }

  /**
   * Init the update system
   * @param mainWindow
   * @return {Updater}
   */
  init = (mainWindow) => {
    this._mainWindow = mainWindow
    if (this._init) {
      return this
    }

    // Listener
    autoUpdater.on('update-available', this.available)
    autoUpdater.on('update-not-available', this.noUpdate)
    autoUpdater.on('download-progress', this.progress)
    autoUpdater.on('update-downloaded', this.downloaded)
    autoUpdater.on('error', this.error)

    // IPC
    ipcMain.on('check-update', (byUser) => {
      this.check(byUser)
    })
    ipcMain.on('start-update', (event) => {
      this._webcontent = event.sender
      autoUpdater.downloadUpdate()
    })

    // Check interval
    let intervalCheck = 3600
    setInterval(() => {
      this.check(false)
    }, 1000 * intervalCheck)

    this._init = true
    return this
  }

  /**
   * Check update
   * @param {Boolean} byUser Initial by user (to show dialog)
   */
  check = (byUser) => {
    this._byUser = byUser
    autoUpdater.checkForUpdates()
  }

  /**
   * Update is available
   * @param {Object} infos
   */
  available = (infos) => {
    log.info('[UPDATE] Available :', infos)
    localStore.set(localStore.key.UPDATE.NOTE, infos.releaseNotes)

    modalSystem.open('update', '/update', {
      title: 'Mises à jour',
      width: 400,
      height: 500,
      frame: false,
    })
  }

  /**
   * No update : App is up-to-date (call by autoUpdater)
   * @param {Object} infos
   */
  noUpdate = (infos) => {
    log.info('[UPDATE] App is up-to-date')
    if (this._byUser) {
      dialog.showMessageBox(this._mainWindow, {
        type: 'info',
        buttons: ['OK'],
        title: 'Mise à jour',
        message: 'FeedSeries est à jour',
      })
    }
  }

  /**
   * A release was downloaded (call by autoUpdater)
   * @param event
   * @param releaseNotes
   * @param releaseName
   */
  downloaded = (event, releaseNotes, releaseName) => {
    log.info('downloaded', event, releaseNotes, releaseName)
    this._mainWindow.setTitle('FeedSeries')
    if (this._webcontent) {
      this._webcontent.send('start-install', true)
    }

    if (process.env.NODE_ENV !== 'development') {
      app.isQuiting = true
      autoUpdater.quitAndInstall()
    }
  }

  /**
   * During downloaded (call by autoUpdater)
   * @param progress
   */
  progress = (progress) => {
    let percent = Math.round(progress.percent)
    let message = `Download speed: ${progress.bytesPerSecond} - Downloaded ${percent}% (${progress.transferred} / ${progress.total})`
    log.info(message, progress)
    this._mainWindow.setProgressBar(percent / 100)
    if (this._percent !== percent) {
      this._mainWindow.setTitle(`FeedSeries - Téléchargement : ${percent}%`)
      this._percent = percent
      if (this._webcontent) {
        this._webcontent.send('progress-update', percent, progress.bytesPerSecond)
      }
    }
  }

  /**
   * Catch error when update (call by autoUpdater)
   * @param error
   */
  error = (error) => {
    log.error('[UPDATE] Error', error)
    if (this._byUser) {
      dialog.showErrorBox('Mise à jour', 'Impossible de vérifier les mises à jour !')
    }
  }
}

export default new Updater()
