import error from 'controllers/error'
import LogScreen from 'components/log-screen'
import rest from 'controllers/rest'

const screen = new LogScreen({
  title: 'Chargement…',
  state: 'loading'
})

export default async () => {
  try {
    screen.mount(document.body)

    screen.setMessage(null, { progress: 0.5 })
    window.configuration = await rest.get('configuration')

    screen.setMessage(null, { progress: 1 })
    screen.destroy()
  } catch (err) {
    error(err)
  }
}
