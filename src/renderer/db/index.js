import camo from 'camo'
import { remote } from 'electron'

// Load models
import Episode from './models/Episode'
import Show from './models/Show'
import Subtitle from './models/Subtitle'
import Link from './models/Link'

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
          setTimeout(this.compact, 5000)
          resolve()
        })
      })
    } else {
      return Promise.resolve()
    }
  }
  this.compact = () => {
    return new Promise((resolve, reject) => {
      global.dbCollection = camo.getClient().driver()
      for (let collection in global.dbCollection) {
        if (global.dbCollection.hasOwnProperty(collection)) {
          global.dbCollection[collection].persistence.setAutocompactionInterval(1000 * 60 * 60)
          global.dbCollection[collection].on('compaction.done', () => {
            console.log(`[DB] "${collection}" : Compaction done`)
          })
        }
      }
    })
  }
}

export { Cache, Episode, Show, Subtitle, Link }
export default new Database()
