<template>
  <tr class="show-item-view" :class="{seen: episode.isSeen}" @contextmenu.prevent="$parent.$refs.EpisodeCtx.$refs.ctx.open($event, episode)">
    <td>
      <div class="episode-info">
        <span v-show="episode.special" style="color: #1a82fb">[Spécial]</span>
        {{ episode.code }} {{ episode.title }}
        <span class="date" :class="{future: isFuture(episode.date) && !episode.isSeen }">
          <i class="fa"></i>
          <span v-show="episode.date">{{ episode.date|formatDate('ddd DD MMM YYYY') }}</span>
          <span v-show="!episode.date">Pas de date</span>
        </span>
        <i class="fa fa-download" v-show="episode.isDownloaded && !episode.isSeen" v-tooltip="'Épisode récupéré'"></i>
        <i
          class="fa fa-file-alt cursor"
          v-tooltip="$options.filters.plurialize(getSubtitles(episode).length, 'sous-titre', 'sous-titres')"
          @click="$parent.$refs.SubtitleCtx.$refs.ctx.open($event, episode)"></i>
        <friend-bubble :friends="episode.friends"></friend-bubble>
      </div>
    </td>
    <td class="pull-right icon-mark-view">
      <i class="fa fa-eye cursor" @click="markView(episode)" v-show="!episode.isSeen && !show.isArchived" v-tooltip="'Marquer vu'"></i>
      <i class="fa fa-eye-slash cursor" @click="unmarkView(episode)" v-show="episode.isSeen && !show.isArchived" v-tooltip="'Marquer non-vu'"></i>
    </td>
  </tr>
</template>

<script>
  import { types } from '../store'
  import FriendBubble from './FriendBubble'

  export default {
    components: {
      FriendBubble,
    },
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

<style lang="scss">
  .show-item-view {
    .fa {
      margin-left: 3px;
    }

    .date.future {
      color: #b4171f;
      i:before {
        font-size: 8px;
        content: '\f071';
        padding-right: 3px;
      }
    }
    .icon-mark-view {
      .fa {
        font-size: 12px;
        margin-right: 10px;
        vertical-align: middle;
      }
    }
  }
</style>
