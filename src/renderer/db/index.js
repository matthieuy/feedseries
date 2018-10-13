import camo from 'camo'
import fs from 'fs'
import { remote } from 'electron'

// Load models
import Episode from './models/Episode'
import Show from './models/Show'
import Subtitle from './models/Subtitle'
import Link from './models/Link'
import Stat from './models/Stat'

import Cache from './cache'

let Database = function () {
  this._database = null

  /**
   * Init the database
   * @return {Promise}
   */
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

  /**
   * Set the interval to compress DB
   */
  this.compact = () => {
    global.dbCollection = camo.getClient().driver()
    for (let collection in global.dbCollection) {
      if (global.dbCollection.hasOwnProperty(collection)) {
        global.dbCollection[collection].persistence.setAutocompactionInterval(1000 * 60 * 60)
        global.dbCollection[collection].on('compaction.done', () => {
          console.log(`[DB] "${collection}" : Compaction done`)
        })
      }
    }
  }

  /**
   * Get the DB path
   * @param {String} dbName
   * @return {string}
   */
  this.getPath = (dbName) => {
    return require('path').join(remote.app.getPath('userData'), dbName + '.db')
  }

  /**
   * Clear a DB
   * @param {String} dbName
   * @return {Promise}
   */
  this.clearDb = (dbName) => {
    return new Promise((resolve, reject) => {
      fs.unlink(this.getPath(dbName), resolve)
    })
  }

  /**
   * Get the DB size
   * @param {String} dbName
   * @return {number}
   */
  this.getSize = (dbName) => {
    let path = this.getPath(dbName)
    if (fs.existsSync(path)) {
      let stats = fs.statSync(path)
      return stats.size || 0
    }
    return 0
  }
}

export { Cache, Episode, Show, Subtitle, Link, Stat }
export default new Database()
