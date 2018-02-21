import { app, dialog, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'

class Updater {
  /**
   * Construtor : init variables
   */
  constructor () {
    autoUpdater.autoDownload = false
    autoUpdater.fullChangelog = true
    this._init = false
    this._mainWindow = null
    this._byUser = false
    this._percent = 0
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
    dialog.showMessageBox(this._mainWindow, {
      type: 'question',
      buttons: ['Oui', 'Plus tard'],
      defaultId: 0,
      cancelId: 1,
      title: 'Mise à jour',
      message: `Une mise à jour est disponible (${infos.releaseName}) !\nFaut-il la télécharger maintenant ?`,
    }, (response) => {
      if (response === 0) {
        autoUpdater.downloadUpdate()
      }
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
    dialog.showMessageBox(this._mainWindow, {
      type: 'info',
      buttons: ['OK'],
      defaultId: 0,
      title: 'Mise à jour',
      message: process.platform === 'win32' ? releaseNotes : releaseName,
      detail: 'Téléchargement terminé : installation en cours...',
    })
    app.isQuiting = true
    autoUpdater.quitAndInstall()
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
