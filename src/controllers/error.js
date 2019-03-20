import LogScreen from 'components/log-screen'

export default err => {
  err = err instanceof Error ? err : new Error(err)

  const error = new LogScreen({
    title: err.name,
    message: window.isProduction ? err.message : err.message + '\n' + err.stack,
    state: 'error'
  })

  console.error(err)
  error.mount(document.body)
}
