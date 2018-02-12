/**
 * The file enables `@/store/index.js` to import all vuex modules
 * in a one-shot manner.
 */

const files = require.context('.', false, /\.js$/)
const modules = {}
const types = {}

files.keys().forEach(key => {
  if (key === './index.js') return
  types[key.replace(/(\.\/|\.js)/g, '')] = files(key).types
  modules[key.replace(/(\.\/|\.js)/g, '')] = files(key).default
})

export { types }
export default modules
