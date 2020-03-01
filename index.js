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

const spring = (fromValue, toValue, config, update) =>
  new Promise(r =>
    new Spring({...config, fromValue, toValue})
      .onUpdate(s => update(s.currentValue))
      .onStop(() => r())
      .start()
  )

const smoothScroll = (target, x, y) => {
  const config = {stiffness: 120, damping: 20, mass: 1}

  const scrollX = () => {
    if (isNaN(x)) {
      return
    }
    const {scrollLeft: startX, scrollWidth, clientWidth} = target
    const targetX = clamp(x, 0, scrollWidth - clientWidth)
    if (startX === targetX) {
      return
    }
    return spring(startX, targetX, config, v => (target.scrollLeft = v))
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
    return spring(startY, targetY, config, v => (target.scrollTop = v))
  }

  return Promise.all([scrollX(), scrollY()])
}

const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max)
}

const isObject = function(val) {
  const type = typeof val
  return (type === 'object' && val != null) || type === 'function'
}

// @see: https://codesandbox.io/s/assert-scrolltooptions-y5bm4
const assertScrollToOptions = (options, scope, method) => {
  if (!isObject(options)) {
    throw new TypeError(
      `Failed to execute '${method}' on '${scope.constructor.name}': parameter 1 ('options') is not an object.`
    )
  }
}

const polyfillScrollToOptions = (scope, method) => {
  const nativeMethod = scope[method]
  const getTarget = context =>
    context === window
      ? // more robust: https://github.com/mathiasbynens/document.scrollingElement
        document.scrollingElement || document.documentElement
      : context
  const isScrollBy = method === 'scrollBy'
  const fallbackMethod = isScrollBy
    ? function(x, y) {
        // scrollBy(NaN, NaN) => no effect
        if (!isNaN(x)) {
          getTarget(this).scrollLeft += x
        }
        if (!isNaN(y)) {
          getTarget(this).scrollTop += y
        }
      }
    : function(x, y) {
        // scroll(NaN, NaN) => scroll(0, 0)
        getTarget(this).scrollLeft = Number(x) || 0
        getTarget(this).scrollTop = Number(y) || 0
      }

  scope[method] = function() {
    if (arguments.length === 1) {
      const options = arguments[0]
      if (options != null) {
        assertScrollToOptions(options, scope, method)
        const target = getTarget(this)
        const opts = {
          ...defaultScrollToOptions,
          ...options,
        }
        if (isScrollBy) {
          if (!isNaN(opts.left)) {
            opts.left += target.scrollLeft
          }
          if (!isNaN(opts.top)) {
            opts.top += target.scrollTop
          }
        }
        return runScrollOptions(target, opts)
      }
    }
    return (nativeMethod || fallbackMethod).apply(this, arguments)
  }

  return () => {
    scope[method] = nativeMethod
  }
}

const isDetached = target => {
  return !(target && target.ownerDocument.documentElement.contains(target))
}

const scrollIntoView = (target, opts) => {
  if (isDetached(target)) {
    return
  }
  return Promise.all(
    computeScrollIntoView(target, opts).map(({el, top, left}) =>
      runScrollOptions(el, {left, top, behavior: opts.behavior})
    )
  )
}

const polyfillScrollToViewOptions = () => {
  const nativeMethod = Element.prototype.scrollIntoView
  const fallbackMethod = function(alignToTop) {
    return scrollIntoView(
      this,
      alignToTop == null || Boolean(alignToTop)
        ? defaultScrollIntoViewOptions
        : {...defaultScrollIntoViewOptions, block: 'end'}
    )
  }
  Element.prototype.scrollIntoView = function() {
    const options = arguments[0]
    if (isObject(options)) {
      const opts = {
        ...defaultScrollIntoViewOptions,
        ...options,
      }
      return scrollIntoView(this, opts)
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
