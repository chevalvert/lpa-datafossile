import DomComponent from 'abstractions/DomComponent'
import html from 'nanohtml'
import htmlEncode from 'utils/string-html-encode'
import raw from 'nanohtml/raw'

export default class LogScreen extends DomComponent {
  constructor ({
    title = '',
    message = '',
    state = 'log',
    className = undefined
  } = {}) {
    super()
    this.title = title
    this.message = message
    this.state = state
    this.className = className
  }

  render () {
    this.refs.message = html`<div class='log-screen__message'>${raw(htmlEncode(this.message).replace(/\n/g, '<br>'))}</div>`
    return html`
      <section class='log-screen ${this.className}' data-state='${this.state}'>
        <div class='log-screen__content'>
          <h1 class='log-screen__title'>${raw(this.title)}</h1>
          ${this.refs.message}
        </div>
      </section>`
  }

  update () {
    window.requestAnimationFrame(() => {
      if (!this.mounted) return
      this.refs.message.innerHTML = this.message
      this.refs.base.setAttribute('data-state', this.state)
    })
  }

  setMessage (message, { state = this.state, progress = 0 } = {}) {
    this.message = message
    this.state = state
    this.refs.base.style.setProperty('--progress', progress)
    this.update()
  }

  log (message) { this.setMessage(message, { state: 'log' }) }
  success (message) { this.setMessage(message, { state: 'success' }) }
  warning (message) { this.setMessage(message, { state: 'warning' }) }
  error (message) { this.setMessage(message, { state: 'error' }) }
}
