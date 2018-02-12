import camo from 'camo'
import { remote } from 'electron'

// Load models
import Episode from './models/Episode'
import Show from './models/Show'
import Subtitle from './models/Subtitle'

import Cache from './cache'

let Database = function () {
  this._database = null

  this.init = () => {
    if (!this._database) {
      return new Promise((resolve, reject) => {
        let url = 'nedb://' + remote.app.getPath('userData')
        console.info(`[DB] Stock in "${url}"`)
        camo.connect(url).then((db) => {
          this._database = db
          console.info('[DB] Database loaded')
          resolve()
        })
      })
    } else {
      return Promise.resolve()
    }
  }
}

export { Cache, Episode, Show, Subtitle }
export default new Database()
