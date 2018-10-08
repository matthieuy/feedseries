import Vue from 'vue'
import moment from 'moment'
import VueContextMenu from 'vue-context-menu'

// Config VueJS
if (!process.env.IS_WEB) {
  Vue.use(require('vue-electron'))
}
Vue.config.productionTip = false
Vue.use(VueContextMenu)

/**
 * VueJS filters
 */
moment.locale('fr')
Vue.filter('formatDate', (value, format) => {
  if (typeof value === 'undefined') {
    return false
  }
  return moment(String(value)).format(format)
})

Vue.filter('isFuture', (value) => {
  if (typeof value === 'undefined') {
    return false
  }
  return moment(String(value)).isAfter(moment.now())
})

Vue.filter('fromNow', (value) => {
  return moment(String(value)).fromNow()
})

Vue.filter('defaut', (value, defaultValue) => {
  return (typeof value === 'undefined' || value === null) ? defaultValue : value
})

function plurialize (value, singular, plurial) {
  if (typeof value === 'undefined') {
    return plurial
  }
  return (value <= 1) ? `${value} ${singular}` : `${new Intl.NumberFormat().format(value)} ${plurial}`
}
Vue.filter('plurialize', (value, singular, plurial) => {
  return plurialize(value, singular, plurial)
})

Vue.filter('duration', (value) => {
  let duration = moment.duration(parseInt(value), 'minutes')
  let time = ''
  let days = duration.days()
  if (days !== 0) {
    time += days + 'j '
  }
  let hours = duration.hours()
  if (hours !== 0) {
    time += hours + 'h'
  }

  let minutes = duration.minutes()
  if (minutes !== 0) {
    time += minutes + 'min'
  }

  return time
})

Vue.filter('join', (value, glue) => {
  return value.join(glue)
})

Vue.filter('round', (value, decimal) => {
  let power = Math.pow(10, decimal)
  return Math.round(value * power) / power
})

Vue.filter('statusColor', (value) => {
  if (String(value).match(/^([0-9.]*)$/g)) {
    if (value === 100) {
      value = 'active'
    } else if (value !== 0) {
      value = 'current'
    }
  }

  switch (value) {
    case 'current':
    case 'Continuing':
      return 'color: #34c84a'
    case 'active':
      return 'color: #004012'
    case 'archived':
      return 'color: #fdbc40'
    case 'Ended':
      return 'color: #fc605b'
    default:
      return 'color: #000000'
  }
})

Vue.filter('duration_tv', (value) => {
  let duration = moment.duration(parseInt(value), 'minutes')
  let time = []

  let years = duration.years()
  if (years !== 0) {
    time.push(plurialize(years, 'an', 'ans'))
  }

  let month = duration.months()
  if (month !== 0) {
    time.push(`${month} mois`)
  }

  let weeks = duration.weeks()
  if (weeks !== 0) {
    time.push(plurialize(weeks, 'semaine', 'semaines'))
    duration.subtract(weeks, 'weeks')
  }

  let days = duration.days()
  if (days !== 0) {
    time.push(plurialize(days, 'jour', 'jours'))
  }

  let hours = duration.hours()
  if (hours !== 0) {
    time.push(plurialize(hours, 'heure', 'heures'))
  }

  let minutes = duration.minutes()
  if (minutes !== 0) {
    time.push(plurialize(minutes, 'minute', 'minutes'))
  }

  return time.join(', ')
})

Vue.filter('size', (value) => {
  let i = -1
  let byteUnits = [' Kb', ' Mb', ' Gb', ' Tb']
  do {
    value = value / 1024
    i++
  } while (value > 1024)

  return Math.max(value, 0.1).toFixed(1) + byteUnits[i]
})
