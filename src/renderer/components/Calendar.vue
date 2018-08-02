<template>
  <div id="calendar" @contextmenu="rightClick">
    <full-calendar
      :class="{loading: isLoading}"
      class="fc fc-unthemed fc-ltr"
      :config="config"
      :event-sources="eventSources"
      ref="calendar"
      @event-selected="eventClick"
      @event-render="eventRender"
      @event-view-render="eventViewRender"
      @event-loading="eventLoading"
    ></full-calendar>
    <episode-ctx ref="EpisodeCtx" @ctx-episode-close="ctxClose">&nbsp;</episode-ctx>
  </div>
</template>

<script>
  import api from '../api'
  import { localStore } from '../store'
  import EpisodeCtx from './context/EpisodeCtx'
  import FullCalendar from './FullCalendar'
  import { Episode } from '../db'

  export default {
    components: {
      EpisodeCtx,
      FullCalendar,
    },
    data () {
      let self = this

      return {
        isLoading: true,
        dlOnly: localStore.get(localStore.key.CALENDAR.DL_ONLY, false),
        eventSelected: null,
        config: {
          defaultDate: (localStore.get(localStore.key.CALENDAR.SAVE_DATE, false)) ? localStore.get(localStore.key.CALENDAR.LAST_DATE, null) : null,
          defaultView: localStore.get(localStore.key.CALENDAR.VIEW, 'month'),
          header: {
            left: 'prev,next today dlonly',
            center: 'title',
            right: 'month listMonth',
          },
          customButtons: {
            dlonly: {
              text: 'Récupérés',
              click () {
                self.dlOnly = !self.dlOnly
                localStore.set(localStore.key.CALENDAR.DL_ONLY, self.dlOnly)
                self.updateBtnDL(self.dlOnly)
              },
            },
          },
          eventAfterAllRender (view) {
            self.updateBtnDL(self.dlOnly)
            if (view.name === 'listMonth' && self.dlOnly) {
              self.hideHeader()
            }
          },
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
      eventClick (event, jsEvent) {
        if (event.episode.notDB) {
          return false
        }
        this.eventSelected = event
        this.$refs.EpisodeCtx.$refs.ctx.open(jsEvent, event.episode)
      },
      rightClick (e) {
        // Found event
        let el = e.target
        let eventId
        while (el.nodeName !== 'HTML') {
          eventId = el.dataset.eventId
          if (eventId) {
            break
          } else if (el.nodeName === 'BODY') {
            return false
          }

          el = el.parentNode
        }

        let event = this.$refs.calendar.fireMethod('clientEvents', eventId)
        if (event.length !== 1) {
          return false
        }
        event = event[0]

        this.eventClick(event, e)
      },
      ctxClose (episode) {
        this.eventSelected.episode = episode
        this.$refs.calendar.$emit('remove-event', this.eventSelected._id)
        this.$refs.calendar.$emit('render-event', this.eventSelected)
      },
      eventRender (event, el, view) {
        let episode = event.episode
        if (episode.isSeen) {
          el[0].style.display = 'none'
        }
        el[0].dataset.eventId = event._id

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
          if (episode.show.status === 'Ended') {
            iconsEl.innerHTML += '<i class="fa fa-circle" style="' + this.$options.filters.statusColor(episode.show.status) + '"></i>'
          }
        }
      },
      eventViewRender (view, el) {
        if (view.name !== this.config.defaultView) {
          this.config.defaultView = view.name
          localStore.set(localStore.key.CALENDAR.VIEW, view.name)
        }
        localStore.set(localStore.key.CALENDAR.LAST_DATE, view.calendar.currentDate.format('YYYY-MM') + '-01')
      },
      updateBtnDL (dlOnly) {
        let btn = document.getElementsByClassName('fc-dlonly-button')[0]
        if (dlOnly) {
          btn.classList.add('fc-state-active')
          document.getElementById('calendar').classList.add('hide-not-dl')
        } else {
          btn.classList.remove('fc-state-active')
          document.getElementById('calendar').classList.remove('hide-not-dl')
        }
      },
      hideHeader () {
        document.querySelectorAll('.fc-list-heading').forEach((header) => {
          let next = header
          do {
            next = next.nextSibling
            if (!next || next.classList.contains('fc-list-heading') || next.classList.contains('dl')) {
              break
            }

            header.classList.add('not-dl')
          } while (true)
        })
      },
    },
    mounted () {
      console.info('[VUE] Mount Calendar.vue')
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
          let className = []
          let isDL = false

          if (ep) {
            events[i].episode = ep
            className.push('db')
            if (ep.isDownloaded) {
              isDL = true
            }
          } else {
            events[i].episode.notDB = true
            className.push('not-db')
            ep = events[i].episode
            if (ep.user && ep.user.hasOwnProperty('downloaded') && ep.user.downloaded) {
              isDL = true
            }
          }

          if (isDL) {
            className.push('dl')
          } else {
            className.push('not-dl')
          }
          events[i].className = className
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
    .not-db {
      cursor: not-allowed;
    }
    .db {
      cursor: pointer;
    }
  }
  .hide-not-dl .not-dl {
    display: none;
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
