const cors = require('cors')
const Emitter = require('tiny-emitter')
const express = require('express')
const findFirstAvailableAddress = require('@server/utils/find-first-available-network-address')
const path = require('path')
const WebsocketServer = require('@server/controllers/websocket-server')

const app = express()

module.exports = class WebServer extends Emitter {
  constructor ({
    port = 8888,
    dist = path.join(__dirname, '..', '..', 'build'),
    enableWebsocket = true
  } = {}) {
    super()

    this.port = port
    this.dist = dist
    this.enableWebsocket = enableWebsocket

    this.router = express.Router()

    app.use(express.static(dist, { extensions: ['html'] }))
    app.use(express.json())
    app.use(cors({ credentials: true, origin: true }))
    app.use('/api', this.router)
  }

  start () {
    return new Promise(resolve => {
      this.server = app.listen(this.port, () => {
        const address = findFirstAvailableAddress()
        const url = `http://${address}:${this.port}`
        console.log(`Listening to ${url}`)

        if (this.enableWebsocket) {
          this.websocketServer = new WebsocketServer(this.server)
        }

        resolve(url)
      })
    })
  }

  get ws () { return this.websocketServer }
  get app () { return app }
  get express () { return express }
}
