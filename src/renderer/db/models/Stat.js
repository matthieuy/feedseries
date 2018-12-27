import { Document } from 'camo'

/**
 * Type :
 *   v: episodes view
 *   d: episodes download
 *   t: time view
 *   a: show add
 *   r: show archive
 *   s: srt download
 */
class Stat extends Document {
  constructor () {
    super()
    this.schema({
      ts: {
        type: Number,
        default: Stat._getCurrentTs,
      },
      type: String,
      value: {
        type: Number,
        default: 0,
      },
    })
  }

  /**
   * Archive a show
   * @param {Boolean} isArchived
   */
  static archive (isArchived) {
    return this.incrementValue('r', isArchived, 1)
  }

  /**
   * Add a show
   * @param {Boolean} isAdd
   */
  static addShow (isAdd) {
    return this.incrementValue('a', isAdd, 1)
  }

  /**
   * Mark View
   * @param {Boolean} isView
   * @param {Integer} nb
   */
  static markView (isView, nb) {
    return this.incrementValue('v', isView, nb)
  }

  /**
   * Add time view
   * @param {Integer} minute
   * @param {Boolean} isAdd
   * @param {Integer} nb
   */
  static addTimeView (minute, isAdd, nb) {
    return this.incrementValue('t', isAdd, minute * nb)
  }

  /**
   * Mark DL
   * @param {Boolean} isDL
   * @param {Integer} nb
   */
  static markDl (isDL, nb) {
    return this.incrementValue('d', isDL, nb)
  }

  /**
   * Increment a stat
   * @param {String} type
   * @param {Boolean} increment
   * @param {Integer} value
   */
  static incrementValue (type, increment, value) {
    if (!value) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      this.findOne({
        ts: this._getCurrentTs(),
        type: type,
      }).then((stat) => {
        // Create if don't exist
        if (!stat) {
          stat = Stat.create({
            type: type,
          })
        }

        // Increment
        if (increment) {
          stat.value += value
        } else {
          stat.value -= value
        }

        // Save
        stat.save().then(() => {
          return resolve()
        })
      })
    })
  }

  /**
   * Get the current Timestamp
   * @return {number}
   * @private
   */
  static _getCurrentTs () {
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    return currentDate.getTime() / 1000
  }

  /**
   * Get the collection name
   * @return {string}
   */
  static collectionName () {
    return 'stats'
  }
}

export default Stat
