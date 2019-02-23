import { app, dialog, ipcMain, Notification } from 'electron'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'

import modalSystem from '../windows/modalSystem'
import { localStore } from '../../renderer/store'
import db, { Cache } from '../../renderer/db'

class Updater {
  /**
   * Construtor : init variables
   */
  constructor () {
    autoUpdater.autoDownload = false
    autoUpdater.fullChangelog = true
    this.setChannel(localStore.get(localStore.key.UPDATE.PRERELEASE, 'latest'))
    if (process.env.NODE_ENV === 'development') {
      autoUpdater.updateConfigPath = require('path').join(__dirname, '../../../.electron-vue/dev-app-update.yml')
      autoUpdater.currentVersion = '0.0.1'
    }

    this._init = false
    this._mainWindow = null
    this._byUser = false
    this._percent = 0
    this._webcontent = null
    this._interval = null
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
    ipcMain.on('check-update', (event, byUser) => {
      this.check(byUser)
    })
    ipcMain.on('start-update', (event) => {
      this._webcontent = event.sender
      autoUpdater.downloadUpdate()
    })
    ipcMain.on('close-update', (event) => {
      this._webcontent = null
    })
    ipcMain.on('channel-update', (event, channel) => {
      this.setChannel(channel)
    })

    // Interval check
    if (process.env.NODE_ENV !== 'development') {
      this.setUpdateInterval(localStore.get(localStore.key.UPDATE.INTERVAL, 1))
      ipcMain.on('interval-update', (event, intervalCheck) => {
        this.setUpdateInterval(intervalCheck)
      })
    }

    // First check after update
    if (localStore.get(localStore.key.UPDATE.FIRST_RUN, false)) {
      /* eslint-disable no-new */
      let notif = new Notification({
        title: app.getName(),
        body: 'Vous utilisez maintenant la version v' + app.getVersion(),
        icon: localStore.getIconPath(true, true),
      })
      notif.show()
      localStore.set(localStore.key.UPDATE.FIRST_RUN, false)
    }

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
   * Set the interval check
   * @param {Integer} intervalCheck
   */
  setUpdateInterval = (intervalCheck) => {
    intervalCheck = parseInt(intervalCheck)
    clearInterval(this._interval)
    if (intervalCheck) {
      setInterval(() => {
        this.check(false)
      }, 3600000 * intervalCheck)
    }
  }

  /**
   * Set the update channel
   * @param {String} channel (latest|beta|alpha)
   */
  setChannel = (channel) => {
    if (!channel || channel === 'latest') {
      autoUpdater.allowPrerelease = false
      autoUpdater.channel = 'latest'
    } else {
      autoUpdater.allowPrerelease = true
      autoUpdater.channel = channel
    }
  }

  /**
   * Update is available
   * @param {Object} infos
   */
  available = (infos) => {
    log.info('[UPDATE] Available :', infos.version)
    localStore.set(localStore.key.UPDATE.NOTE, infos.releaseNotes)

    let notif = new Notification({
      title: app.getName(),
      body: 'Mise à jour disponible : v' + infos.version,
      icon: localStore.getIconPath(true, true),
    })
    notif.show()

    modalSystem.open('update', '/update', {
      title: 'Mises à jour',
      width: 400,
      height: 500,
      frame: false,
      skipTaskbar: false,
    })
  }

  /**
   * No update : App is up-to-date (call by autoUpdater)
   * @param {Object} infos
   */
  noUpdate = (infos) => {
    if (this._byUser) {
      log.info('[UPDATE] App is up-to-date')
      dialog.showMessageBox(this._mainWindow, {
        type: 'info',
        buttons: ['OK'],
        title: 'Mise à jour',
        message: 'FeedSeries est à jour : ' + infos.releaseName,
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
      localStore.set(localStore.key.UPDATE.FIRST_RUN, true)
      app.isQuiting = true

      // Vidage cache + db
      Cache.reset()
      Cache.rmCacheData()
      db.clearDb('shows')
      db.clearDb('episodes')
      db.clearDb('subtitles')

      // Installation
      autoUpdater.quitAndInstall()
    }
  }

  /**
   * During downloaded (call by autoUpdater)
   * @param progress
   */
  progress = (progress) => {
    let percent = Math.round(progress.percent)
    this._mainWindow.setProgressBar(percent / 100)
    if (this._percent !== percent) {
      if (percent % 10 === 0) {
        let message = `Download speed: ${progress.bytesPerSecond} - Downloaded ${percent}% (${progress.transferred} / ${progress.total})`
        log.info(message)
      }
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
