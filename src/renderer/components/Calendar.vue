<template>
  <div>
    <full-calendar
      :class="{loading: isLoading}"
      class="fc fc-unthemed fc-ltr"
      :config="config"
      :event-sources="eventSources"
      @event-render="eventRender"
      @event-view-render="eventViewRender"
      @event-loading="eventLoading"
    ></full-calendar>
  </div>
</template>

<script>
  import api from '../api'
  import { localStore } from '../store'
  import FullCalendar from './FullCalendar'
  import { Episode } from '../db'

  export default {
    components: {
      FullCalendar,
    },
    data () {
      return {
        isLoading: true,
        config: {
          defaultDate: (localStore.get(localStore.key.CALENDAR.SAVE_DATE, false)) ? localStore.get(localStore.key.CALENDAR.LAST_DATE, null) : null,
          defaultView: localStore.get(localStore.key.PLANNING.VIEW, 'month'),
          eventOrder (a, b) {
            // DL first
            if (a.miscProps.episode.isDownloaded !== b.miscProps.episode.isDownloaded) {
              return a.miscProps.episode.isDownloaded ? -1 : 1
            }

            return a.title.localeCompare(b.title)
          },
        },
        eventSources: [
          // Member planning
          {
            events (start, end, timezone, cb) {
              api.planning.getMemberBetween(start, end).then((events) => {
                populateEvents(events, cb)
              }).catch(() => {
                let events = []
                cb(events)
              })
            },
            className: 'member-planning',
            color: '#6d6c6d',
          },
          // Firsts episodes planning
          {
            events (start, end, timezone, cb) {
              let day = start.add(15, 'days')
              api.planning.getPremieres(day).then((events) => {
                populateEvents(events, cb)
              }).catch(() => {
                let events = []
                cb(events)
              })
            },
            className: 'premieres',
            color: '#c3c3c3',
            textColor: '#282c34',
          },
        ],
      }
    },
    methods: {
      eventLoading (isLoading, view) {
        this.isLoading = isLoading
      },
      eventRender (event, el, view) {
        let episode = event.episode

        let iconsEl
        if (view.name === 'listMonth') {
          // Add title
          let title = el[0].querySelector('.fc-list-item-title')
          title.innerHTML += ` - <i>${episode.title}</i>`
          iconsEl = title
        } else {
          iconsEl = el[0].querySelector('.fc-content')
        }

        // Icons
        if ((episode.user && episode.user.downloaded) || (!episode.notDB && episode.isDownloaded)) {
          iconsEl.innerHTML += `<i class="fa fa-download"></i>`
        }
        if (!episode.notDB) {
          if (episode.show.isArchived) {
            iconsEl.innerHTML += `<i class="fa fa-archive"></i>`
          }

          if (episode.show.isFavorited) {
            iconsEl.innerHTML += `<i class="fa fa-heart"></i>`
          }
        }
      },
      eventViewRender (view, el) {
        if (view.name !== this.config.defaultView) {
          this.config.defaultView = view.name
          localStore.set(localStore.key.PLANNING.VIEW, view.name)
        }
        localStore.set(localStore.key.CALENDAR.LAST_DATE, view.calendar.currentDate.format('YYYY-MM') + '-01')
      },
    },
  }

  /**
   * Populate events with episodes
   * @param events List of events
   * @param cb Calendar Callback
   */
  function populateEvents (events, cb) {
    let promisesList = []
    for (let i = 0; i < events.length; i++) {
      let p = new Promise((resolve, reject) => {
        Episode.findOne({ _id: events[i].episode.id + '' }).then((ep) => {
          if (ep) {
            events[i].episode = ep
          } else {
            events[i].episode.notDB = true
          }
          resolve()
        })
      })
      promisesList.push(p)
    }

    Promise.all(promisesList).then(() => {
      cb(events)
    })
  }
</script>

<style lang="scss">
  @import "../assets/scss/vars.scss";
  @import "../assets/scss/fullcalendar.scss";

  div#calendar {
    margin: 0 25px 15px 25px;
    .fa-download {
      color: #08417d;
    }
    .fa {
      margin-left: 5px;
    }
  }

  .fc-unthemed td.fc-today {
    background: lighten($navActiveBg, 10%);
    .fc-day-number { color: #F00; }
  }
  .fc-toolbar {
    h2 {
      text-transform: capitalize;
      font-size: 36px;
    }
    .fc-left, .fc-right {
      margin-top: 30px;
    }
  }
  .fc-unthemed .fc-list-heading td { background: lighten($navActiveBg, 10%); }
  .fc-unthemed .fc-list-item:hover td { background: $navActiveBg; }
  .fc-list-view .fc-list-item-time { display: none; }
  .fc-event { margin-bottom: 2px; }
  .loading .fc-view-container, .fc-view-container { transition: opacity .5s; }
  .loading .fc-view-container { opacity: 0.2; }
</style>
