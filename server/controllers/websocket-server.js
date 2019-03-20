const Emitter = require('tiny-emitter')
const websocket = require('ws')

module.exports = class WebSocketServer extends Emitter {
  constructor (server) {
    super()
    if (!server) {
      throw Error('WebSocketServer constructor must be given a valid express app')
    }

    this.server = new websocket.Server({ server })
    this.server.on('connection', client => {
      client.on('message', message => {
        const json = JSON.parse(message)
        this.emit(json.event, json.data)
      })

      client.on('error', err => {
        this.emit('error', err)
        if (err.code === 'ECONNRESET') this.emit('clientQuit', client)
      })

      client.on('close', () => this.emit('clientQuit', client))
      this.emit('client', client)
    })

    this.server.on('error', err => this.emit('error', err))
  }

  get clients () { return this.server.clients }

  broadcast (event, data) {
    this.clients.forEach(client => client.send(JSON.stringify({ event, data })))
  }
}
