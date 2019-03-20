import arrayMedian from 'utils/array-median'
import datas from 'controllers/dataset'
import DataTimeline from 'components/data-timeline'
import DomComponent from 'abstractions/DomComponent'
import html from 'nanohtml'
import moment from 'moment'
import store from 'controllers/store'

const CACHED = {}

const parseDate = day => {
  const RFC2822 = new Date('20' + day[0].date.split('/').reverse().join('-')).toUTCString()
  return moment(RFC2822).locale('fr').format('dddd Do MMMM YYYY')
}

const computeStats = day => {
  const values = Object.values(day)
    .map(halfhour => halfhour['présences'])
    .sort((a, b) => a - b)

  return {
    min: values[0],
    max: values[values.length - 1],
    moy: (values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(2).replace('.', ','),
    med: arrayMedian(values, { alreadySorted: true }).toFixed(2).replace('.', ',')
  }
}

export default class DataSummary extends DomComponent {
  render () {
    this.refs.date = html`<div class='data-summary__date'></div>`
    this.refs.timeline = this.registerComponent(DataTimeline)
    this.refs.stats = html`<div class='data-summary__stats'></div>`
    return html`
    <section class='data-summary'>
      ${this.refs.date}
      ${this.refs.timeline.raw()}
      ${this.refs.stats}
    </section>`
  }

  didMount () {
    this.bindFuncs(['update'])
    store.watch('datasetIndex', this.update, { immediate: true })
  }

  willUnmount () {
    store.unwatch('datasetIndex', this.update)
  }

  update (index = 0) {
    this.day = Object.values(datas)[index]
    if (!CACHED[index]) {
      CACHED[index] = {
        date: parseDate(this.day),
        stats: Object.entries(computeStats(this.day)).map(([key, stat]) => `<div class='data-summary__stat' data-key='${key}'>${stat}</div>`).join('')
      }
    }
    this.refs.date.innerHTML = CACHED[index].date
    this.refs.stats.innerHTML = CACHED[index].stats
  }
}
