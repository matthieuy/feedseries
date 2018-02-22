import { Document } from 'camo'

class Link extends Document {
  constructor () {
    super()
    this.schema({
      showId: String,
      name: String,
      base: String,
      path: String,
    })
  }

  /**
   * Set the URL (to split base + path)
   * @param {String} value the complete URL
   */
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

  /**
   * Get the complete URL
   * @return {String}
   */
  get url () {
    return this.base + '/' + this.path
  }

  /**
   * Get the favicon URL
   * @return {String}
   */
  get icon () {
    return this.base + '/favicon.ico'
  }

  /**
   * Update or create a link
   * @param {Link|Object} The link
   * @return {Promise}
   */
  static updateOrCreate (link) {
    return this.findOneAndUpdate({ _id: link._id }, link, { upsert: true })
  }

  /**
   * Get links for a show
   * @param {Integer} showId
   * @return {Promise} links
   */
  static getLinks (showId) {
    return this.find({ showId: showId }, { sort: '_id' })
  }

  /**
   * Get the collection name
   * @return {string}
   */
  static collectionName() {
    return 'links'
  }
}

export default Link
