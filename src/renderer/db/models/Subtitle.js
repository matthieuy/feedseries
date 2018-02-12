import { Document } from 'camo'

class Subtitle extends Document {
  constructor () {
    super()
    this.schema({
      language: String,
      name: String,
      showId: String,
      episode: String,
      season: Number,
    })
  }

  static cleanProperties (subtitle, episode) {
    let showId, episodeNumber, season
    if (typeof episode === 'undefined') {
      showId = subtitle.episode.show_id
      episodeNumber = subtitle.episode.episode
      season = subtitle.episode.season
    } else {
      showId = episode.show.id
      episodeNumber = episode.episode
      season = episode.season
    }

    return {
      _id: String(subtitle.id),
      language: subtitle.language,
      name: subtitle.file,
      showId: String(showId),
      episode: episodeNumber,
      season: season,
    }
  }
}

export default Subtitle
