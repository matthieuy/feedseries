<template>
  <div>
    <full-calendar :class="{loading: isLoading}" class="fc fc-unthemed fc-ltr" :event-sources="eventSources" @event-render="eventRender" @event-loading="eventLoading"></full-calendar>
  </div>
</template>

<script>
  import api from '../api'
  import FullCalendar from './FullCalendar'

  export default {
    components: {
      FullCalendar,
    },
    data () {
      return {
        isLoading: true,
        eventSources: [
          // Member planning
          {
            events (start, end, timezone, cb) {
              api.planning.getMember(start).then((events) => {
                cb(events)
              }).catch(() => {
                let events = []
                cb(events)
              })
            },
            color: '#6d6c6d',
          },
          // Firsts episodes planning
          {
            events (start, end, timezone, cb) {
              let day = start.add(15, 'days')
              api.planning.getPremieres(day).then((events) => {
                cb(events)
              }).catch(() => {
                let events = []
                cb(events)
              })
            },
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
        if (view.name === 'listMonth') {
          let title = el[0].querySelector('.fc-list-item-title')
          title.innerHTML += ` - <i>${event.episode.title}</i>`
        }
      },
    },
  }
</script>

<style lang="scss">
  @import "../assets/scss/vars.scss";
  @import "../assets/scss/fullcalendar.scss";

  div#calendar { margin: 0 25px 15px 25px; }

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
