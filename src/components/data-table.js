import 'nodelist-foreach'
import datas from 'controllers/dataset'
import DomComponent from 'abstractions/DomComponent'
import html from 'nanohtml'
import store from 'controllers/store'

const CACHED = {}

const columns = {
  'horaire': item => item['heure'],
  'occupation': item => item['% occupation'].toFixed(2).replace('.', ',') + '%',
  'évolution': (item, prev, next) => {
    if (!prev) return ''
    if (prev['% occupation'] > item['% occupation']) return '/'
    if (prev['% occupation'] < item['% occupation']) return '\\'
    if (prev['% occupation'] === item['% occupation']) return '—'
  },
  'entrées': item => item['entrées'],
  'sorties': item => item['sorties']
}

export default class DataTable extends DomComponent {
  render () {
    this.refs.items = html`<ul class='data-table__items'></ul>`
    return html`
    <section class='data-table'>
      <header class='data-table__header'>
        ${Object.keys(columns).map(k => html`<div class='data-table__header-item'>${k}</div>`)}
      </header>
      ${this.refs.items}
    </section>`
  }

  didMount () {
    this.bindFuncs(['update'])
    store.watch('datasetIndex', this.update, { immediate: true })
    store.set('datasetDayIndex', 0)
  }

  willUnmount () {
    store.unwatch('datasetIndex', this.update)
  }

  update (index = 0) {
    this.day = Object.values(datas)[index]
    if (!CACHED[index]) {
      CACHED[index] = this.day.map((halfHour, index) => {
        const values = Object.values(columns).map(parser => parser(halfHour, this.day[index - 1], this.day[index + 1]))
        return `
        <li class='data-table__item'>
          ${values.map(v => `<div class='data-table__item-content'>${v}</div>`).join('')}
        </li>`
      }).join('')
    }
    this.refs.items.innerHTML = CACHED[index]
    this.attachTouchListener()
  }

  attachTouchListener () {
    this.refs.items.querySelectorAll('li').forEach((item, index) => {
      item.addEventListener('click', e => store.set('datasetDayIndex', index))
    })
  }
}
