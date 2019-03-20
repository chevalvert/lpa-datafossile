import load from 'controllers/loader'
import Navigo from 'navigo'
import RemoteApp from 'layouts/remote'
import store from 'controllers/store'
import ViewerApp from 'layouts/viewer'

if (!window.isProduction) {
  require('fps-indicator')({
    color: 'white',
    position: 'top-right'
  })
}

const mount = App => () => {
  load()
  .then(() => {
    new App().mount(document.body)
  })
}

new Navigo(null, false).on({
  '/remote': mount(RemoteApp),
  '/remote.html': mount(RemoteApp),
  '/viewer': mount(ViewerApp),
  '/viewer.html': mount(ViewerApp)
}).resolve()

store.websocketSync([
  'datasetIndex',
  'datasetDayIndex'
])
