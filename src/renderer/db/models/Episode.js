import { Document } from 'camo'
import Show from './Show'

class Episode extends Document {
  constructor () {
    super()
    this.schema({
      show: Show,
      code: String,
      title: String,
      date: String,
      description: String,
      season: Number,
      episode: Number,
      global: Number,
      special: Boolean,
      isDownloaded: Boolean,
      isSeen: Boolean,
      friends: Array,
      youtube: String,
    })
  }

  /**
   * Get unseen episodes
   * @return {Promise}
   */
  static getUnseen () {
    return this.find({isSeen: false}, {populate: true, sort: '_id'}).then((episodes) => {
      episodes = episodes.filter((episode) => {
        return episode.show && episode.show.isArchived === false
      })

      return Promise.resolve(episodes)
    })
  }

  /**
   * Mark episode as DL or not
   * @param {Episode} episode
   * @param {Boolean} isDL
   * @return {Promise}
   */
  static markDL (episode, isDL) {
    return this.findOneAndUpdate({ _id: episode._id + '' }, { isDownloaded: isDL })
  }

  /**
   * Mark episode as view
   * @param {Episode} episode
   * @param {Boolean} isSeen
   * @return {Promise}
   */
  static markView (episode, isSeen) {
    if (typeof isSeen === 'undefined') {
      isSeen = true
    }

    let self = this
    return this.findOneAndUpdate({ _id: episode._id + '' }, { isSeen: isSeen }).then((episodeSaved) => {
      let show = episodeSaved.show

      // Update show.remaining and show.progress after mark episode
      self.find({show: show._id}).then((episodes) => {
        // Get show
        if (!episodes.length) {
          return false
        }
        let showCopy = episodes[0].show

        // Update show
        let seen = episodes.filter((a) => { return a.isSeen })
        showCopy.remaining = episodes.length - seen.length
        showCopy.progress = Math.round(seen.length / episodes.length * 10000) / 100
        showCopy.save()
      })
      return Promise.resolve(episodeSaved)
    })
  }

  /**
   * Clean properties to upsert a Episode
   * @param {Object} episode
   * @returns {Object}
   */
  static cleanProperties (episode) {
    let properties = {
      _id: String(episode.id),
      show: String(episode.show.id),
      code: episode.code,
      title: episode.title,
      date: episode.date,
      description: episode.description,
      season: episode.season,
      episode: episode.episode,
      global: episode.global,
      special: episode.special === 1,
      isDownloaded: episode.user.downloaded || false,
      isSeen: episode.user.seen || false,
    }

    if (episode.hasOwnProperty('watched_by') && episode.watched_by.length) {
      properties.friends = episode.watched_by
    }
    if (episode.hasOwnProperty('youtube_id') && episode.youtube_id) {
      properties.youtube = episode.youtube_id
    }

    return properties
  }

  /**
   * Get the collection name
   * @return {string}
   */
  static collectionName () {
    return 'episodes'
  }
}

export default Episode
