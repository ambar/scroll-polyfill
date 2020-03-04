import polyfill from './index'

const scrollingElement = document.documentElement
Object.defineProperties(scrollingElement, {
  scrollHeight: {value: 2000},
  scrollWidth: {value: 2000},
  clientWidth: {value: 1680},
  clientHeight: {value: 800},
})

const nativeMethods = [
  [window, 'scroll'],
  [window, 'scrollBy'],
  [window, 'scrollTo'],
  [Element.prototype, 'scroll'],
  [Element.prototype, 'scrollBy'],
  [Element.prototype, 'scrollTo'],
  [Element.prototype, 'scrollIntoView'],
].map(([scope, method]) => [scope, method, scope[method]])

describe('polyfill', () => {
  let unpolyfill
  afterEach(() => {
    unpolyfill()
  })

  test('default install', () => {
    unpolyfill = polyfill()
    if ('scrollBehavior' in document.documentElement.style) {
      nativeMethods.forEach(([scope, method, native]) =>
        expect(scope[method]).toBe(native)
      )
    } else {
      nativeMethods.forEach(([scope, method, native]) =>
        expect(scope[method]).not.toBe(native)
      )
    }
  })

  test('force install', () => {
    unpolyfill = polyfill({force: true})
    nativeMethods.forEach(([scope, method, native]) =>
      expect(scope[method]).not.toBe(native)
    )
  })
})

describe('scrollToOptions', () => {
  let unpolyfill
  beforeAll(() => {
    unpolyfill = polyfill({force: true})
  })

  afterAll(() => {
    unpolyfill()
  })

  afterEach(() => {
    scrollingElement.scrollTop = 0
    scrollingElement.scrollLeft = 0
  })

  test('parameter', async () => {
    const okValues = [1, true, '', Symbol()]
    okValues.forEach(value => {
      expect(() => window.scroll(value)).toThrow(TypeError)
      expect(() => scrollingElement.scroll(value)).toThrow(TypeError)
    })

    const failValues = [null, undefined, [], {}, () => {}]
    failValues.forEach(value => {
      expect(() => window.scroll(value)).not.toThrow(TypeError)
      expect(() => scrollingElement.scroll(value)).not.toThrow(TypeError)
    })
  })

  test('scroll', () => {
    scrollingElement.scroll({left: NaN, top: 100})
    expect(scrollingElement.scrollTop).toBe(100)

    scrollingElement.scroll({left: 100, top: NaN})
    expect(scrollingElement.scrollLeft).toBe(100)
    expect(scrollingElement.scrollTop).toBe(100)

    scrollingElement.scroll({left: 200, top: 200})
    expect(scrollingElement.scrollLeft).toBe(200)
    expect(scrollingElement.scrollTop).toBe(200)
  })

  test('scrollTo', () => {
    scrollingElement.scrollTo({left: NaN, top: 100})
    expect(scrollingElement.scrollTop).toBe(100)

    scrollingElement.scrollTo({left: 100, top: NaN})
    expect(scrollingElement.scrollLeft).toBe(100)
    expect(scrollingElement.scrollTop).toBe(100)

    scrollingElement.scrollTo({left: 200, top: 200})
    expect(scrollingElement.scrollLeft).toBe(200)
    expect(scrollingElement.scrollTop).toBe(200)
  })

  test('scrollBy', () => {
    scrollingElement.scrollBy({left: NaN, top: 100})
    expect(scrollingElement.scrollTop).toBe(100)

    scrollingElement.scrollBy({left: 100, top: NaN})
    expect(scrollingElement.scrollLeft).toBe(100)
    expect(scrollingElement.scrollTop).toBe(100)

    scrollingElement.scrollBy({left: 200, top: 200})
    expect(scrollingElement.scrollLeft).toBe(300)
    expect(scrollingElement.scrollTop).toBe(300)

    scrollingElement.scrollBy({left: 0, top: 100})
    expect(scrollingElement.scrollLeft).toBe(300)
    expect(scrollingElement.scrollTop).toBe(400)
  })
})

describe('scrollIntoView', () => {
  let unpolyfill
  beforeAll(() => {
    unpolyfill = polyfill({force: true})
  })

  afterAll(() => {
    unpolyfill()
  })

  afterEach(() => {
    scrollingElement.scrollTop = 0
    scrollingElement.scrollLeft = 0
  })

  test('parameter', async () => {
    const failValues = [
      1,
      true,
      '',
      Symbol(),
      null,
      undefined,
      [],
      {},
      () => {},
    ]
    failValues.forEach(value => {
      expect(() => scrollingElement.scrollIntoView(value)).not.toThrow(
        TypeError
      )
    })
  })
})
