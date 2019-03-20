import DomComponent from 'abstractions/DomComponent'
import html from 'nanohtml'
import store from 'controllers/store'
import { map } from 'missing-math'

export default class DataSummary extends DomComponent {
  constructor () {
    super()
    this.bindFuncs(['onchange', 'jumpTo'])
  }

  render () {
    this.refs.input = html`
    <input
      class='data-timeline__input'
      type='range'
      min='${window.configuration['datasetRange'][0]}'
      max='${window.configuration['datasetRange'][1]}'
      step='1'
      value='${window.configuration['datasetRange'][0]}'
      oninput=${this.onchange}
      onchange=${this.onchange}
      list='dataTimelineDays'
    />`

    return html`
    <div class='data-timeline'>
      ${this.refs.input}
      <div class='data-timeline__ticks'>
        ${Array(window.configuration['datasetRange'][1] - window.configuration['datasetRange'][0] + 1).fill().map(_ => {
          return html`<div class='data-timeline__tick'></div>`
        })}
      </datalist>
    </div>`
  }

  didMount () {
    this.onchange()
    this.refs.base.addEventListener('click', this.jumpTo)
  }

  willUnmount () {
    this.refs.base.removeEventListener('click', this.jumpTo)
  }

  jumpTo (e) {
    if (e.target === this.refs.input) return

    e.preventDefault()

    const nv = e.pageX / this.refs.base.clientWidth
    this.refs.input.value = Math.round(map(nv, 0, 1, ...window.configuration['datasetRange']))
    this.onchange()
  }

  onchange () {
    window.requestAnimationFrame(() => {
      store.set('datasetIndex', parseInt(this.refs.input.value))
    })
  }
}
