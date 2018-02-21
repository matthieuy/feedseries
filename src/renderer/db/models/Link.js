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

  /**
   * Get links for a show
   * @param {Show|Object} show The show
   * @return {Promise} links
   */
  static getLinks (show) {
    let idShow = show._id || show.id
    return this.find({ show: idShow }, { sort: 'name' })
  }
}

export default Link
