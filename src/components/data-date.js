import datas from 'controllers/dataset'
import DomComponent from 'abstractions/DomComponent'
import html from 'nanohtml'
import moment from 'moment'
import store from 'controllers/store'

const CACHED = {}

const parseDate = day => {
  const RFC2822 = new Date('20' + day[0].date.split('/').reverse().join('-')).toUTCString()
  return {
    dddd: moment(RFC2822).locale('fr').format('dddd'),
    do: moment(RFC2822).locale('fr').format('Do'),
    mmmm: moment(RFC2822).locale('fr').format('MMMM'),
    yyyy: moment(RFC2822).locale('fr').format('YYYY')
  }
}

export default class DataSummary extends DomComponent {
  render () {
    return html`
    <section class='data-date'
      style='
        --fade-in-duration: ${window.configuration.viewer['dateFadeInDuration']}ms;
        --fade-out-duration: ${window.configuration.viewer['dateFadeOutDuration']}ms;
        --size:${window.configuration.viewer['dateSizeVH']}vh;
      '
    >
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
    if (!CACHED[index]) CACHED[index] = parseDate(this.day)
    this.refs.base.innerHTML = `
      <span class='day'>${CACHED[index].dddd}</span>
      <span class='month'>${CACHED[index].do}&nbsp;${CACHED[index].mmmm}</span>
      <span class='year'>${CACHED[index].yyyy}</span>
    `

    clearTimeout(this.visibilityTimeout)
    this.addClass('is-visible')
    this.visibilityTimeout = setTimeout(() => {
      this.removeClass('is-visible')
    }, window.configuration.viewer['dateVisibilityDuration'])
  }
}
