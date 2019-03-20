const configuration = require('@configuration')
const Serialed = require('serialed')

const ctrlr = new Serialed.SerialedController()
ctrlr.addNode(
  configuration['hardware'].address,
  configuration['hardware'].pixelsLength
)

const observers = []
let now = Date.now()
let last = now
let frameCount = 0
ctrlr.on('next', () => {
  now = Date.now()
  frameCount++
  for (let i = 0; i < observers.length; i++) {
    observers[i](now - last, frameCount)
  }
  last = now
})

process.on('SIGINT', kill)
process.on('SIGTERM', kill)
process.on('uncaughtException', err => {
  console.error(err)
  kill()
})

function kill () {
  ctrlr.close()
  process.exit(1)
}

module.exports = {
  kill,
  clear: ctrlr.clear.bind(ctrlr),
  segment: (sliceIndex, color = configuration['hardware'].white) => {
    const segmentsLength = configuration['hardware'].segmentsLength
    const segmentLength = configuration['hardware'].pixelsLength / segmentsLength

    for (let i = 0; i < segmentsLength; i++) {
      const x = i % 2
        ? (segmentLength * (i + 1) - 1) - sliceIndex
        : sliceIndex + segmentLength * i
      ctrlr.led(x, ...color)
    }
  },

  raf: fn => {
    if (typeof fn === 'function' && !~observers.indexOf(fn)) {
      observers.push(fn)
    }
  }
}
