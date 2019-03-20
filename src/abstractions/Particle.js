import { random } from 'missing-math'
import distSq from 'utils/distance-squared'

export default class Particle {
  constructor (x, y) {
    this.x = x
    this.y = y
    this.speed = random(10)
    this.dx = random(-1, 1)
    this.dy = random(-1, 1)
    this.trailLength = 5 + (Math.random() ** 2) * 95
    this.trail = []
    this.percentWhenStopSeekingTarget = 0.3
    this.shouldBounce = true
  }

  get target () { return this._target }
  set target ([x, y]) {
    this._target = [x, y]
    this.intialDistanceFromTarget = distSq([this.x, this.y], this.target)
  }

  updateBehavior () {
    if (this.target && distSq([this.x, this.y], this.target) < this.intialDistanceFromTarget * this.percentWhenStopSeekingTarget) {
      this._target = null
      this.dx = random(-1, 1)
      this.dy = random(-1, 1)
      this.speed = random(1)
    }

    if (this.target) {
      this.dx = (this.target[0] - this.x) * 0.01
      this.dy = (this.target[1] - this.y) * 0.01
    }

    if (random(100) > 99) this.speed = random(1)
    if (random(100) > 90) {
      this.dx += random(-1, 1)
      this.dy += random(-1, 1)
    }

    if (random(100) > 99) this.dx = -this.dx
    if (random(100) > 99) this.dy = -this.dy
  }

  update ({ width = 100, height = 100 } = {}) {
    this.updateBehavior()

    this.x += this.dx * this.speed
    this.y += this.dy * this.speed
    if (this.shouldBounce && (this.x < 0 || this.x > width)) this.dx = -this.dx
    if (this.shouldBounce && (this.y < 0 || this.y > height)) this.dy = -this.dy

    this.trail.push([this.x, this.y])
    if (this.trail.length > this.trailLength) this.trail.shift()
  }

  draw (ctx) {
    ctx.beginPath()
    this.trail.forEach(([x, y], index) => {
      ctx[index === 0 ? 'moveTo' : 'lineTo'](x, y)
    })
    ctx.stroke()
  }
}
