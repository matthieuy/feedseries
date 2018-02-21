import { Document } from 'camo'

import Show from './Show'

class Link extends Document {
  constructor () {
    super()
    this.schema({
      show: Show,
      name: String,
      base: String,
      path: String,
    })
  }

  set url (value) {
    let urlArray = value.split('/')
    this.base = urlArray[0] + '//' + urlArray[2]

    let path = value.replace(this.base, '')
    let startIndex = 0
    while (path[startIndex] === '/') {
      startIndex++
    }
    this.path = path.substr(startIndex)
  }

  get url () {
    return this.base + '/' + this.path
  }

  get icon () {
    return this.base + '/favicon.ico'
  }

  /**
   * Get links for a show
   * @param {Show|Object} show The show
   * @return {Promise} links
   */
  static getLinks (show) {
    let idShow = show._id || show.id
    return this.find({ show: idShow }, { sort: '_id' })
  }
}

export default Link
