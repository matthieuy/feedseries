<template>
    <div ref="calendar" id="calendar"></div>
</template>

<script>
  import 'fullcalendar'
  import $ from 'jquery'
  let cal

  export default {
    props: {
      events: {
        default () {
          return []
        },
      },
      eventSources: {
        default () {
          return []
        },
      },
      sync: {
        default () {
          return false
        },
      },
      config: {
        type: Object,
        default () {
          return {}
        },
      },
    },
    computed: {
      defaultConfig () {
        const self = this
        return {
          header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month listMonth',
          },
          buttonText: {
            today: 'Aujourd\'hui',
            month: 'Agenda',
            listMonth: 'Planning',
          },
          defaultView: 'month',
          listDayFormat: 'dddd  DD MMMM Y',
          listDayAltFormat: false,
          editable: false,
          selectable: false,
          selectHelper: true,
          aspectRatio: 2.5,
          height: 'auto',
          locale: 'fr',
          events: this.events,
          eventSources: this.eventSources,
          eventRender (...args) {
            if (this.sync) {
              self.events = cal.fullCalendar('clientEvents')
            }
            self.$emit('event-render', ...args)
          },
          eventDestroy (event) {
            if (this.sync) {
              self.events = cal.fullCalendar('clientEvents')
            }
          },
          eventClick (...args) {
            self.$emit('event-selected', ...args)
          },
          eventDrop (...args) {
            self.$emit('event-drop', ...args)
          },
          eventResize (...args) {
            self.$emit('event-resize', ...args)
          },
          dayClick (...args) {
            self.$emit('day-click', ...args)
          },
          select (start, end, jsEvent, view, resource) {
            self.$emit('event-created', {
              start,
              end,
              allDay: !start.hasTime() && !end.hasTime(),
              view,
              resource,
            })
          },
          loading (...args) {
            self.$emit('event-loading', ...args)
          },
        }
      },
    },
    mounted () {
      cal = $(this.$el)

      this.$on('remove-event', (event) => {
        if (event && event.hasOwnProperty('id')) {
          $(this.$el).fullCalendar('removeEvents', event.id)
        } else {
          $(this.$el).fullCalendar('removeEvents', event)
        }
      })

      this.$on('rerender-events', () => {
        $(this.$el).fullCalendar('rerenderEvents')
      })

      this.$on('refetch-events', () => {
        $(this.$el).fullCalendar('refetchEvents')
      })

      this.$on('render-event', (event) => {
        $(this.$el).fullCalendar('renderEvent', event)
      })

      this.$on('reload-events', () => {
        $(this.$el).fullCalendar('removeEvents')
        $(this.$el).fullCalendar('addEventSource', this.events)
      })

      this.$on('rebuild-sources', () => {
        $(this.$el).fullCalendar('removeEventSources')
        this.eventSources.map(event => {
          $(this.$el).fullCalendar('addEventSource', event)
        })
      })

      let config = Object.assign({}, this.defaultConfig, this.config)
      cal.fullCalendar(config)
    },
    methods: {
      fireMethod (...options) {
        return $(this.$el).fullCalendar(...options)
      },
    },
    watch: {
      events: {
        deep: true,
        handler (val) {
          $(this.$el).fullCalendar('removeEvents')
          $(this.$el).fullCalendar('addEventSource', this.events)
        },
      },
      eventSources: {
        deep: true,
        handler (val) {
          this.$emit('rebuild-sources')
        },
      },
    },
    beforeDestroy () {
      this.$off('remove-event')
      this.$off('rerender-events')
      this.$off('refetch-events')
      this.$off('render-event')
      this.$off('reload-events')
      this.$off('rebuild-sources')
    },
  }
</script>
