import { autoUpdater } from 'electron-updater'
import { app, dialog, ipcMain } from 'electron'

export default {
  mainWindow: null,
  byUser: false,
  inited: false,
  init (mainWindow) {
    console.info('[UPDATE] Init system')
    this.mainWindow = mainWindow
    if (this.inited) {
      return this
    }
    autoUpdater.autoDownload = false
    autoUpdater.on('checking-for-update', this.startCheck)
    autoUpdater.on('update-downloaded', this.downloaded)
    autoUpdater.on('update-not-available', this.noUpdate)
    autoUpdater.on('update-available', this.availableUpdate)
    autoUpdater.on('download-progress', this.progress)
    autoUpdater.on('error', this.error)
    this.inited = true

    ipcMain.on('check-update', (byUser) => {
      this.check(byUser)
    })

    return this
  },
  check (byUser) {
    this.byUser = byUser
    autoUpdater.checkForUpdates()
  },
  startCheck () {
    console.info('[UPDATE] Start check')
  },
  noUpdate (info) {
    console.info('App is up-to-date', info)
    if (this.byUser) {
      dialog.showMessageBox(this.mainWindow, {
        type: 'info',
        buttons: ['OK'],
        title: 'Mise à jour',
        message: 'Aucune mise à jour disponible',
      })
    }
  },
  availableUpdate (info) {
    console.info('Update', info)
    dialog.showMessageBox(this.mainWindow, {
      type: 'question',
      buttons: ['Oui', 'Plus tard'],
      defaultId: 0,
      cancelId: 1,
      title: 'Mise à jour',
      message: 'Une mise à jour est disponible ! Faut-il la télécharger maintenant ?',
    }, (response) => {
      if (response === 0) {
        autoUpdater.downloadUpdate()
      }
    })
  },
  downloaded (event, releaseNotes, releaseName) {
    console.info('downloaded', event, releaseNotes, releaseName)
    dialog.showMessageBox(this.mainWindow, {
      type: 'info',
      buttons: ['OK', 'Plus tard'],
      defaultId: 0,
      cancelId: 0,
      title: 'Mise à jour',
      message: process.platform === 'win32' ? releaseNotes : releaseName,
      detail: 'Téléchargement terminé : installation en cours...',
    })
    app.isQuiting = true
    autoUpdater.quitAndInstall()
  },
  progress (progress) {
    let message = `Download speed: ${progress.bytesPerSecond} - Downloaded ${progress.percent}% (${progress.transferred} / ${progress.total})`
    console.info(message, progress)
    if (this.mainWindow) {
      this.mainWindow.setProgressBar(progress.percent / 100)
    }
  },
  error (error) {
    if (this.byUser) {
      console.info('[UPDATE] Error', error)
      dialog.showErrorBox('Mise à jour', 'Impossible de vérifier les mises à jour !')
    }
  },
}
