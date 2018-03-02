import { Document } from 'camo'

class Show extends Document {
  constructor () {
    super()
    this.schema({
      title: {
        type: String,
        required: true,
      },
      creation: String,
      description: String,
      nb_episodes: Number,
      nb_seasons: Number,
      followers: Number,
      genres: [String],
      in_account: Boolean,
      runtime: Number,
      network: String,
      slug: String,
      imdb: String,
      tvdb: Number,
      characters: Number,
      similars: Number,
      comments: Number,
      status: String,
      isArchived: Boolean,
      isFavorited: Boolean,
      remaining: Number,
      progress: Number,
      image: String,
      note: Number,
    })
  }

  /**
   * Archive a show
   * @param {Show} show
   * @param {Boolean} isArchived
   * @return {Promise}
   */
  static archive (show, isArchived) {
    return this.findOneAndUpdate({ _id: show._id + '' }, { isArchived: isArchived })
  }

  /**
   * Favorite a show
   * @param {Show} show
   * @param {Boolean} isFavorited
   * @return {Promise}
   */
  static favorite (show, isFavorited) {
    return this.findOneAndUpdate({ _id: show._id + '' }, { isFavorited: isFavorited })
  }

  /**
   * Get favorites shows
   * @return {Promise}
   */
  static getFavorites () {
    return this.find({ isFavorited: true })
  }

  /**
   * Get show by id
   * @param {Integer} id
   */
  static getById (id) {
    return this.findOne({ _id: id }, { populate: true })
  }

  /**
   * Clean properties to upsert a Episode
   * @param {Object} show
   * @returns {Object}
   */
  static cleanProperties (show) {
    return {
      _id: String(show.id),
      title: show.title,
      creation: show.creation,
      nb_episodes: parseInt(show.episodes),
      nb_seasons: parseInt(show.seasons),
      followers: parseInt(show.followers),
      genres: show.genres,
      in_account: show.in_account,
      runtime: parseInt(show.length),
      network: show.network,
      slug: show.resource_url.replace('https://www.betaseries.com/serie/', ''),
      imdb: show.imdb_id,
      tvdb: show.thetvdb_id,
      characters: parseInt(show.characters),
      similars: parseInt(show.similars),
      comments: parseInt(show.comments),
      status: show.status,
      isArchived: show.user.archived,
      isFavorited: show.user.favorited,
      remaining: show.user.remaining,
      progress: show.user.status,
      description: show.description,
      image: (show.images.show) ? show.images.show.replace('https://www.betaseries.com/images/fonds/show/', '') : null,
      note: Math.round(show.notes.mean * 10) / 10,
    }
  }

  /**
   * Get the collection name
   * @return {string}
   */
  static collectionName () {
    return 'shows'
  }
}

export default Show
