<template>
  <tr :class="{seen: episode.isSeen}" @contextmenu.prevent="$parent.$refs.EpisodeCtx.$refs.ctx.open($event, episode)">
    <td>
      <div class="episode-info">
        <span v-show="episode.special" style="color: #1a82fb">[Spécial]</span>
        {{ episode.code }} {{ episode.title }}
        <span class="date" :class="{future: isFuture(episode.date) && !episode.isSeen }">
          <i class="fa"></i>
          <span v-show="episode.date">{{ episode.date|formatDate('ddd DD MMM YYYY') }}</span>
          <span v-show="!episode.date">Pas de date</span>
        </span>
        <i class="fa fa-download" v-show="episode.isDownloaded && !episode.isSeen" title="Épisode récupéré"></i>
        <i
          class="fa fa-file-alt cursor"
          :title="getSubtitles(episode).length|plurialize('sous-titre', 'sous-titres')"
          @click="$parent.$refs.SubtitleCtx.$refs.ctx.open($event, episode)"></i>
      </div>
    </td>
    <td class="pull-right icon-mark-view">
      <i class="fa fa-eye cursor" @click="markView(episode)" v-show="!episode.isSeen && !show.isArchived" title="Marquer vu"></i>
      <i class="fa fa-eye-slash cursor" @click="unmarkView(episode)" v-show="episode.isSeen && !show.isArchived" title="Marquer non-vu"></i>
    </td>
  </tr>
</template>

<script>
  import { types } from '../store'

  export default {
    props: ['show', 'episode'],
    methods: {
      markView (episode) {
        this.$store.dispatch(types.episodes.ACTIONS.MARK_VIEW, episode)
      },
      unmarkView (episode) {
        this.$store.dispatch(types.episodes.ACTIONS.UNMARK_VIEW, episode)
      },
      getSubtitles (episode) {
        return this.$store.getters[types.subtitles.GETTERS.SUBTITLES](episode)
      },
      isFuture (date) {
        return this.$options.filters.isFuture(date)
      },
    },
  }
</script>
