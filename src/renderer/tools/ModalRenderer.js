import { remote, ipcRenderer } from 'electron'

class ModalRenderer {
  constructor (name) {
    this.name = name
    this.closeListener = []
    this.onData = {}

    ipcRenderer.removeAllListeners(this.name + '-modal')
    ipcRenderer.on(this.name + '-modal', (event, payload) => {
      console.log('[IPC] Receive', payload)

      if (this.onData[payload.action]) {
        for (let i = 0; i < this.onData[payload.action].length; i++) {
          this.onData[payload.action][i](payload.data)
        }
      }
    })
  }

  on (action, callback) {
    if (!this.onData[action]) {
      this.onData[action] = []
    }
    this.onData[action].push(callback)
    return this
  }

  sendToModal (action, data) {
    let payload = {
      action,
      data,
    }
    console.log('[IPC] Send to modal', action, payload)

    let webContent = remote.getCurrentWindow().getChildWindows()[0].webContents
    webContent.send(this.name + '-modal', payload)

    return this
  }

  sendToParent (action, data) {
    let payload = {
      action,
      data,
    }
    console.log('[IPC] Send to parent', action, payload)

    let webContents = remote.getCurrentWindow().getParentWindow().webContents
    webContents.send(this.name + '-modal', payload)

    return this
  }

  openModal (url, options) {
    // Open modal
    console.log('[MODAL] Open ', name)
    ipcRenderer.send('open-modal', name, url, options)

    // On close
    ipcRenderer.once('modal-close', (event, modalName) => {
      if (modalName === this.name) {
        console.log('[MODAL] Close modal :', modalName)
        ipcRenderer.removeAllListeners(this.name + '-modal')
      }

      for (let i = 0; i < this.closeListener.length; i++) {
        this.closeListener[i]()
      }
    })

    return this
  }

  oncloseModal (callback) {
    this.closeListener.push(callback)
    return this
  }
}

export default ModalRenderer
