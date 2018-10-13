import { Document } from 'camo'

/**
 * Type :
 *   v: episodes view
 *   d: episodes download
 *   a: show add
 *   r: show archive
 *   s: srt download
 */
class Stat extends Document {
  constructor () {
    super()
    this.schema({
      ts: Number,
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
    this.incrementValue('r', isArchived)
  }

  /**
   * Add a show
   * @param {Boolean} isAdd
   */
  static addShow (isAdd) {
    this.incrementValue('a', isAdd)
  }

  /**
   * Mark View
   * @param {Boolean} isView
   */
  static markView (isView) {
    this.incrementValue('v', isView)
  }

  /**
   * Mark DL
   * @param {Boolean} isDL
   */
  static markDl (isDL) {
    this.incrementValue('d', isDL)
  }

  /**
   * Increment a stat
   * @param {String} type
   * @param {Boolean} increment
   */
  static incrementValue (type, increment) {
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)
    this.findOne({
      ts: currentDate.getTime(),
      type: type,
    }).then((stat) => {
      // Create if don't exist
      if (!stat) {
        stat = Stat.create({
          ts: currentDate.getTime(),
          type: type,
        })
      }

      // Increment
      if (increment) {
        stat.value++
      } else {
        stat.value--
      }

      // Save
      stat.save()
    })
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
