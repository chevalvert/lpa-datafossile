import DomComponent from 'abstractions/DomComponent'
import html from 'nanohtml'
import DataTable from 'components/data-table'
import DataSummary from 'components/data-summary'

export default class RemoteApp extends DomComponent {
  didMount () {
    console.log('remote app is mounted')
  }

  render () {
    this.refs.table = this.registerComponent(DataTable)
    this.refs.summary = this.registerComponent(DataSummary)

    return html`
    <main id='RemoteApp' class='app'>
      ${this.refs.table.raw()}
      ${this.refs.summary.raw()}
    </main>`
  }
}
