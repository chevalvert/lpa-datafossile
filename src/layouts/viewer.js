import DataDate from 'components/data-date'
import Datagrid from 'abstractions/Datagrid'
import datas from 'controllers/dataset'
import DomComponent from 'abstractions/DomComponent'
import html from 'nanohtml'
import Particle from 'abstractions/Particle'
import raf from '@internet/raf'
import store from 'controllers/store'
import { random } from 'missing-math'

function randomTargetOutsideBox (width, height, radius = Math.min(width, height)) {
  // NOTE: this make sure to create a particle outside the screen
  const theta = random(Math.PI * 2)
  return [
    width / 2 + Math.sin(theta) * radius,
    height / 2 + Math.cos(theta) * radius
  ]
}

export default class ViewerApp extends DomComponent {
  constructor () {
    super()
    this.bindFuncs([
      'update',
      'resize',
      'regroupParticles',
      'addParticle'
    ])
    this.datagrid = new Datagrid()
    this.particles = []
  }

  render () {
    this.refs.date = this.registerComponent(DataDate)
    this.refs.canvas = html`<canvas></canvas>`
    return html`<main id='ViewerApp' class='app'>
      ${this.refs.date.raw()}
      ${this.refs.canvas}
    </main>`
  }

  get width () {
    return this.refs.canvas
      ? this.refs.canvas.width / window.configuration.viewer['pixelDensity']
      : window.innerWidth
  }

  get height () {
    return this.refs.canvas
      ? this.refs.canvas.height / window.configuration.viewer['pixelDensity']
      : window.innerHeight
  }

  didMount () {
    this.resize()

    this.ctx = this.refs.canvas.getContext('2d')
    this.ctx.scale(window.configuration.viewer['pixelDensity'], window.configuration.viewer['pixelDensity'])
    this.ctx.lineCap = 'round'
    this.ctx.lineJoin = 'round'
    this.ctx.fillStyle = 'white'

    store.watch('datasetIndex', index => {
      const day = Object.values(datas)[store.get('datasetDay') || window.configuration['datasetRange'][0]]
      const halfhour = day[0]
      const maxLength = window.configuration['viewer'].particlesMaxLength

      this.particles = []
      this.updateParticlesLength(maxLength * (halfhour['% occupation'] / 100))
      this.regroupParticles()
    })

    store.watch('datasetDayIndex', index => {
      const day = Object.values(datas)[store.get('datasetDay') || window.configuration['datasetRange'][0]]
      const halfhour = day[index]
      const maxLength = window.configuration['viewer'].particlesMaxLength

      this.updateParticlesLength(maxLength * (halfhour['% occupation'] / 100))
    })

    raf.add(this.update)
  }

  regroupParticles () {
    const randomTarget = [random(this.width), random(this.height)]
    this.particles.forEach(p => {
      p.target = randomTarget
      p.speed = 10
      p.percentWhenStopSeekingTarget = 0.01
    })
  }

  resize ({ width = window.innerWidth, height = window.innerHeight } = {}) {
    if (!this.mounted) return
    this.refs.canvas.width = width * window.configuration.viewer['pixelDensity']
    this.refs.canvas.height = height * window.configuration.viewer['pixelDensity']
    this.refs.canvas.style.width = width + 'px'
    this.refs.canvas.style.height = height + 'px'
  }

  update (dt) {
    if (!window.isProduction) window.particlesLength = this.particles.length

    this.ctx.clearRect(0, 0, this.width, this.height)

    this.datagrid.update()
    this.particles.forEach(p => p.update({ width: this.width, height: this.height }))

    this.ctx.strokeStyle = 'white'
    this.ctx.lineWidth = 2
    this.datagrid.draw(this.ctx, { width: this.width, height: this.height })

    this.ctx.strokeStyle = 'white'
    this.ctx.lineWidth = 20
    this.particles.forEach(p => p.draw(this.ctx))

    this.ctx.strokeStyle = 'black'
    this.ctx.lineWidth = 10
    this.particles.forEach(p => p.draw(this.ctx))
  }

  updateParticlesLength (targetLength) {
    for (let i = targetLength; i < this.particles.length; i++) this.removeParticle()
    for (let i = this.particles.length; i < targetLength; i++) this.addParticle()
  }

  addParticle (x = random(this.width), y = random(this.height)) {
    const p = new Particle(...randomTargetOutsideBox(this.width, this.height))
    p.target = [x, y]
    p.speed = 1
    p.percentWhenStopSeekingTarget = 0.1
    this.particles.push(p)
  }

  removeParticle () {
    const p = this.particles.shift()
    if (!p) return

    p.target = randomTargetOutsideBox(this.width, this.height, this.width * 2)
    p.shouldBounce = false
    p.speed = 2
    p.percentWhenStopSeekingTarget = 0.1
    this.particles.push(p)

    setTimeout(() => {
      this.particles.splice(this.particles.indexOf(p), 1)
    }, 3000)
  }
}
