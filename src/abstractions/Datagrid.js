import datas from 'controllers/dataset'
import store from 'controllers/store'
import { map } from 'missing-math'

export default class Datagrid {
  constructor () {
    this.index = store.get('datasetIndex') || 0
    this.datas = [...this.tdatas]
    this.scale = window.configuration['viewer'].dataGridScale

    store.watch('datasetIndex', i => { this.index = i })
  }

  get index () { return this._index }
  set index (index) {
    this._index = index
    this.tdatas = Object.values(datas)[index].map(data => {
      return data['% occupation'] / 100
    })
  }

  update () {
    for (let i = 0; i < this.datas.length; i++) {
      const d = this.datas[i]
      const t = this.tdatas[i]
      this.datas[i] += (t - d) * window.configuration['viewer'].dataGridEasing
    }
  }

  draw (ctx, { width = 100, height = 100 } = {}) {
    const step = map(1, 0, this.datas.length, 0, width)

    ctx.beginPath()
    for (let i = 1; i < this.datas.length; i += this.scale) {
      const x = map(i, 0, this.datas.length, 0, width)
      const y = this.datas[i] * height

      ctx.moveTo(x, height - y)
      ctx.lineTo(x, height)

      for (let j = step; j < y; j += step * this.scale) {
        ctx.moveTo(Math.ceil(x - (step * this.scale) / 2), height - j)
        ctx.lineTo(Math.floor(x + (step * this.scale) / 2), height - j)
      }
    }
    ctx.stroke()
  }
}
