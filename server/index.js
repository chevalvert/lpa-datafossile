#!/usr/bin/env node
require('module-alias/register')

const configuration = require('@configuration')
const hardware = require('@server/controllers/hardware')
const iddler = require('@server/controllers/iddler')
const opn = require('opn')
const rest = require('@server/utils/decorate-rest-action')
const WebServer = require('@server/controllers/web-server')

hardware.raf((dt, frameCount) => {
  if (!iddler.isIddle) return

  const len = configuration['datasetRange'][1] - configuration['datasetRange'][0]
  for (let i = 0; i < len; i++) {
    const o = Math.sin(i + frameCount * 0.01)
    const color = configuration['hardware'].white.map(v => v * o)
    hardware.segment(i, ...color)
  }
})

const server = new WebServer(configuration.host)
server
.start()
.then(url => {
  server.router.get('/configuration', rest((_, success) => success(configuration)))
  server.ws.on('__STORE.sync', sync)

  if (configuration.kiosk) {
    // OMG please stop I do not have time for this
    if (process.platform === 'linux') {
      const { exec } = require('child_process')
      exec('killall chrome', () => {
        setTimeout(() => {
          exec(`google-chrome --kiosk --incognito http://localhost:8888/viewer`)
        }, 5000)
      })
    } else {
      return opn(`server/USAGE`, {
        app: [
          configuration['viewer'].browser,
          '--kiosk',
          '--disable-translate',
          `--app=${url}/viewer`
        ]
      })
    }
  }
})
.catch(err => {
  console.error(err)
  process.exit(1)
})

function sync (data) {
  if (!data) return

  if (data.key === 'datasetIndex') {
    const index = data.value
    const sliceIndex = index - configuration['datasetRange'][0]

    iddler.reset()
    hardware.clear()
    hardware.segment(sliceIndex)
  }

  server.ws.broadcast('__STORE.sync', data)
}
