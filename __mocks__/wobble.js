export class Spring {
  constructor({fromValue, toValue}) {
    this.toValue = toValue
    this.fromValue = fromValue
  }
  onUpdate(fn) {
    this.onUpdate_ = fn
    return this
  }
  onStop(fn) {
    this.onStop_ = fn
    return this
  }
  start() {
    this.onUpdate_({currentValue: this.toValue})
    this.onStop_()
  }
}
