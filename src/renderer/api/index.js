/**
 * API
 * @process renderer
 */

require('../config/api')
const api = {}

// Load API modules
const files = require.context('./modules', false, /\.js$/)
files.keys().forEach(key => {
  let moduleName = key.replace(/(\.\/|\.js)/g, '')
  api[moduleName] = files(key).default
})

export default api
