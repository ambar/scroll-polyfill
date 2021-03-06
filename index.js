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

const doScroll = (target, left, top, behavior) => {
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
    const startX = target.scrollLeft
    if (startX === x) {
      return
    }
    return spring(startX, x, v => (target.scrollLeft = v))
  }

  const scrollY = () => {
    if (isNaN(y)) {
      return
    }
    const startY = target.scrollTop
    if (startY === y) {
      return
    }
    return spring(startY, y, v => (target.scrollTop = v))
  }

  return Promise.all([scrollX(), scrollY()])
}

const clampOptions = (target, {left, top}) => {
  const isRootScoller = target === getScrollingElement(target.ownerDocument)

  const clampX = () => {
    if (isNaN(left)) {
      return
    }
    const scrollportWidth = isRootScoller
      ? target.ownerDocument.documentElement.clientWidth // for IE & Edge
      : target.clientWidth
    const scrollLeftMax = target.scrollWidth - scrollportWidth
    return clamp(left, 0, scrollLeftMax)
  }

  const clampY = () => {
    if (isNaN(top)) {
      return
    }
    const scrollportHeight = isRootScoller
      ? target.ownerDocument.documentElement.clientHeight
      : target.clientHeight
    const scrollTopMax = target.scrollHeight - scrollportHeight
    return clamp(top, 0, scrollTopMax)
  }

  return {left: clampX(), top: clampY()}
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

const getScrollingElement = doc => {
  // more robust: https://github.com/mathiasbynens/document.scrollingElement
  return doc.scrollingElement || doc.documentElement
}

const normTarget = obj =>
  isWindow(obj) ? getScrollingElement(obj.document) : obj

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

    const finalOpts = mapOptions ? mapOptions(opts, target) : opts
    const {left, top} = clampOptions(target, finalOpts)
    return doScroll(target, left, top, finalOpts.behavior)
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
      doScroll(el, left, top, opts.behavior)
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
