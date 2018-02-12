import ElectronStore from 'electron-store'

class Cache {
  constructor () {
    this._cacheStore = new ElectronStore({ name: 'cache' })
    this._transformTags = (tags) => {
      if (Array.isArray(tags)) return tags

      let result = []
      Object.keys(tags).forEach((key) => {
        (Array.isArray(tags[key]) ? tags[key] : [tags[key]]).forEach((tag) => {
          let flat = key + ':' + tag
          if (result.indexOf(flat) < 0) {
            result.push(flat)
          }
        })
      })
      return result
    }
  }

  /**
   * Get a item value
   * @param key
   * @param defaultValue
   * @returns {*}
   */
  get = (key, defaultValue) => {
    if (this._cacheStore.has(key)) {
      let item = this._cacheStore.get(key)
      return item.data
    }
    return defaultValue
  }

  /**
   * Set a item
   * @param key the uniq key
   * @param data Data
   * @param ttl ttl (in minute) 0 => illimit
   * @param tags List of tag
   */
  set = (key, data, ttl, tags) => {
    tags = (typeof tags !== 'undefined') ? this._transformTags(tags) : []

    this._cacheStore.set(key, {
      data: data,
      ttl: (typeof ttl !== 'undefined') ? ttl : 0,
      date: Date.now(),
      tags: tags,
    })
  }

  /**
   * Update data without change ttl (only update if exist key)
   * @param key the uniq key
   * @param data Data
   */
  update = (key, data) => {
    let item = this._cacheStore.get(key, false)
    if (item !== false) {
      item.data = data
      this._cacheStore.set(key, item)
    }
  }

  /**
   * Check if key is valid
   * @param key
   * @returns {Boolean}
   */
  isValid = (key) => {
    if (this._cacheStore.has(key)) {
      let item = this._cacheStore.get(key)
      return !(item.ttl && ((item.ttl * 60000) < (Date.now() - item.date)))
    }
    return false
  }

  /**
   * Invalidate one item
   * @param key
   */
  invalidate = (key) => {
    this._cacheStore.delete(key)
  }

  /**
   * Invalidate by tags
   * @param tags
   */
  invalidateByTags = (tags) => {
    tags = this._transformTags(tags)
    let items = this._cacheStore.store

    for (let key in items) {
      if (!items[key]) continue
      let tagsItem = this._transformTags(items[key]['tags'])
      tagsItem.forEach((tag) => {
        if (tags.indexOf(tag) > -1) {
          console.debug('[CACHE] Delete ' + key)
          this.invalidate(key)
        }
      })
    }
  }

  /**
   * Clear all cache
   */
  reset = () => {
    this._cacheStore.clear()
  }

  /**
   * Open cache file in editor
   */
  openInEditor = () => {
    this._cacheStore.openInEditor()
  }

  /**
   * Show items in console
   */
  debug = () => {
    console.debug(this._cacheStore.store)
  }
}

export default new Cache()
