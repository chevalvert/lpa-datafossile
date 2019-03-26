const configuration = require('@configuration')

let isIddle = true
let waitForIddleness

function reset () {
  isIddle = false
  clearTimeout(waitForIddleness)
  waitForIddleness = setTimeout(() => {
    isIddle = true
  }, configuration['iddleAfter'])
}

module.exports = {
  reset,
  get isIddle () { return isIddle }
}
