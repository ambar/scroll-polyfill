import computeScrollIntoView from 'compute-scroll-into-view'
import {Spring} from 'wobble'

// @see https://developer.mozilla.org/en-US/docs/Web/API/ScrollToOptions
const defaultScrollToOptions = {
  behavior: 'auto',
  left: undefined,
  top: undefined,
}

// @see https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollInToView
const defaultScrollIntoViewOptions = {
  behavior: 'auto',
  block: 'start',
  inline: 'nearest',
}

const runScrollOptions = (target, {left, top, behavior}) => {
  if (behavior === 'smooth') {
    return smoothScroll(target, left, top)
  }

  // scroll({left: NaN, top: NaN}) => scroll({})
  if (!isNaN(left)) {
    target.scrollLeft = left
  }
  if (!isNaN(top)) {
    target.scrollTop = top
  }
}

const defaultSpringConfig = {
  stiffness: 170,
  damping: 26,
  mass: 1,
  restVelocityThreshold: 0.01,
  restDisplacementThreshold: 0.1,
}

const spring = (fromValue, toValue, update) =>
  new Promise(r =>
    new Spring({...defaultSpringConfig, fromValue, toValue})
      .onUpdate(s => update(s.currentValue))
      .onStop(() => r())
      .start()
  )

const smoothScroll = (target, x, y) => {
  const scrollX = () => {
    if (isNaN(x)) {
      return
    }
    const {scrollLeft: startX, scrollWidth, clientWidth} = target
    const targetX = clamp(x, 0, scrollWidth - clientWidth)
    if (startX === targetX) {
      return
    }
    return spring(startX, targetX, v => (target.scrollLeft = v))
  }

  const scrollY = () => {
    if (isNaN(y)) {
      return
    }
    const {scrollTop: startY, scrollHeight, clientHeight} = target
    const targetY = clamp(y, 0, scrollHeight - clientHeight)
    if (startY === targetY) {
      return
    }
    return spring(startY, targetY, v => (target.scrollTop = v))
  }

  return Promise.all([scrollX(), scrollY()])
}

const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max)
}

const isObject = val => {
  const type = typeof val
  return (type === 'object' && val != null) || type === 'function'
}

const isWindow = obj => obj.window === obj

// @see: https://codesandbox.io/s/assert-scrolltooptions-y5bm4
const assertScrollToOptions = (options, target, method) => {
  if (!isObject(options)) {
    const ctor = isWindow(target) ? 'Window' : 'Element'
    throw new TypeError(
      `Failed to execute '${method}' on '${ctor}': parameter 1 ('options') is not an object.`
    )
  }
}

const normTarget = obj =>
  isWindow(obj)
    ? // more robust: https://github.com/mathiasbynens/document.scrollingElement
      obj.document.scrollingElement || obj.document.documentElement
    : obj

const isDetached = target => {
  return !(target && target.ownerDocument.documentElement.contains(target))
}

const createScrollTo = (method, mapOptions) => {
  return (target, options) => {
    if (options == null) {
      return
    }
    assertScrollToOptions(options, target, method)

    target = normTarget(target)
    if (isDetached(target)) {
      return
    }

    const opts = {
      ...defaultScrollToOptions,
      ...options,
    }
    return runScrollOptions(
      target,
      mapOptions ? mapOptions(opts, target) : opts
    )
  }
}

export const scrollTo = createScrollTo('scrollTo')
export const scroll = createScrollTo('scroll')
export const scrollBy = createScrollTo('scrollBy', (opts, target) => {
  if (!isNaN(opts.left)) {
    opts.left += target.scrollLeft
  }
  if (!isNaN(opts.top)) {
    opts.top += target.scrollTop
  }
  return opts
})

export const scrollIntoView = (target, options) => {
  target = normTarget(target)
  if (isDetached(target)) {
    return
  }

  const opts = {
    ...defaultScrollIntoViewOptions,
    ...(isObject(options)
      ? options
      : !(options == null || Boolean(options)) && {block: 'end'}),
  }
  return Promise.all(
    computeScrollIntoView(target, opts).map(({el, top, left}) =>
      runScrollOptions(el, {left, top, behavior: opts.behavior})
    )
  )
}

const polyfillScrollToOptions = (scope, method) => {
  const nativeMethod = scope[method]
  const isScrollBy = method === 'scrollBy'
  const fallbackMethod = isScrollBy
    ? function(x, y) {
        // scrollBy(NaN, NaN) => no effect
        scrollBy(this, {
          left: isNaN(x) ? undefined : Number(x),
          top: isNaN(y) ? undefined : Number(y),
        })
      }
    : function(x, y) {
        // scroll(NaN, NaN) => scroll(0, 0)
        scrollTo(this, {left: Number(x) || 0, top: Number(y) || 0})
      }

  scope[method] = function() {
    if (arguments.length === 1) {
      return (isScrollBy ? scrollBy : scrollTo)(this, arguments[0])
    }
    return (nativeMethod || fallbackMethod).apply(this, arguments)
  }

  return () => {
    scope[method] = nativeMethod
  }
}

const polyfillScrollToViewOptions = () => {
  const nativeMethod = Element.prototype.scrollIntoView
  const fallbackMethod = function(alignToTop) {
    return scrollIntoView(this, alignToTop)
  }
  Element.prototype.scrollIntoView = function() {
    const options = arguments[0]
    if (isObject(options)) {
      return scrollIntoView(this, options)
    }
    return (nativeMethod || fallbackMethod).apply(this, arguments)
  }

  return () => {
    Element.prototype.scrollIntoView = nativeMethod
  }
}

const polyfill = ({force = false} = {}) => {
  if (
    typeof document !== 'undefined' &&
    (force || !('scrollBehavior' in document.documentElement.style))
  ) {
    const undoFns = [
      polyfillScrollToOptions(window, 'scroll'),
      polyfillScrollToOptions(window, 'scrollBy'),
      polyfillScrollToOptions(window, 'scrollTo'),
      polyfillScrollToOptions(Element.prototype, 'scroll'),
      polyfillScrollToOptions(Element.prototype, 'scrollBy'),
      polyfillScrollToOptions(Element.prototype, 'scrollTo'),
      polyfillScrollToViewOptions(),
    ]
    return () => {
      undoFns.forEach(f => f())
    }
  }

  return () => {}
}

export default polyfill
