class ConcurentPromise {
  constructor () {
    this.promises = []
  }

  /**
   * Add a promise
   * @param {Promise} promise
   * @return {ConcurentPromise}
   */
  addPromise (promise) {
    this.promises.push(promise)
    return this
  }

  /**
   * The "then" promise
   * @param {Function} cb
   * @return {ConcurentPromise}
   */
  then (cb) {
    this._then = cb

    return this
  }

  /**
   * Call the then method
   */
  callThen () {
    this._then.apply(null, arguments)
  }

  /**
   * Do a callback if error on the last add promise
   * @param {Function} cb
   * @return {ConcurentPromise}
   */
  reverse (cb) {
    this.promises[this.promises.length - 1].catch((e) => {
      console.info('[PROMISE] Reverse', e)
      cb()
    })

    return this
  }

  /**
   * Do all promises in race
   * @return {Promise}
   */
  race () {
    for (let i = 0; i < this.promises.length; i++) {
      this.promises[i].then(this._then)
    }

    return Promise.race(this.promises)
  }
}

export default ConcurentPromise
