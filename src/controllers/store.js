import Emitter from 'tiny-emitter'
import noop from 'utils/noop'
import websocket from 'controllers/websocket'

const NS = '__STORE.'
const events = new Emitter()
const stored = {}
if (!window.isProduction) window.store = stored

const store = {
  watch: (k, cb, { immediate = false } = {}) => {
    events.on(NS + k, cb)
    if (immediate) cb(stored[k])
  },
  watchOnce: (k, cb, { immediate = false } = {}) => {
    events.once(NS + k, cb)
    if (immediate) cb(stored[k])
  },
  unwatch: (k, cb) => events.off(NS + k, cb),

  get: k => stored[k],
  set: (k, val, { silent = false, doNotSync = false } = {}) => {
    if (!k) return
    stored[k] = val
    if (!silent) events.emit(NS + k, val)
    if (!doNotSync) events.emit(NS + k + 'sync', val)
    return val
  },

  transform: (k, transformation = noop) => {
    stored[k] = transformation(stored[k])
    events.emit(NS + k, stored[k])
    return stored[k]
  },
  increment: k => store.transform(k, k => (k || 0) + 1),
  decrement: k => store.transform(k, k => (k || 0) - 1),

  websocketSync: keys => keys.forEach(key => {
    events.on(NS + key + 'sync', value => {
      websocket.send(NS + 'sync', { key, value })
    })
  })
}

export default store

websocket.on(NS + 'sync', data => {
  if (!data) return
  if (store.get(data.key) === data.value) return

  store.set(data.key, data.value, { doNotSync: true })
})
