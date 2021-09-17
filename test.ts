import polyfill, {scrollIntoView, scrollTo} from './index'

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
  // @ts-expect-error
].map(([scope, method]) => [scope, method, scope[method]])

type Uninstall = ReturnType<typeof polyfill>

describe('polyfill', () => {
  let unpolyfill: Uninstall
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
  let unpolyfill: Uninstall
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
    okValues.forEach((value) => {
      // @ts-expect-error not assignable
      expect(() => window.scroll(value)).toThrow(TypeError)
      // @ts-expect-error not assignable
      expect(() => scrollingElement.scroll(value)).toThrow(TypeError)
    })

    const failValues = [null, undefined, [], {}, () => {}]
    failValues.forEach((value) => {
      // @ts-expect-error not assignable
      expect(() => window.scroll(value)).not.toThrow(TypeError)
      // @ts-expect-error not assignable
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

    scrollingElement.scrollTo(10, 10)
    expect([scrollingElement.scrollLeft, scrollingElement.scrollTop]).toEqual([
      10, 10,
    ])
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

    scrollingElement.scrollBy(10, 10)
    expect([scrollingElement.scrollLeft, scrollingElement.scrollTop]).toEqual([
      310, 410,
    ])
  })

  test('detached', async () => {
    const div = document.createElement('div')
    const scrollTop = 1000
    div!.scrollTop = 1000

    scrollTo(div, {top: scrollTop})
    expect(div!.scrollTop).toBe(scrollTop)

    document.body.appendChild(div)
    scrollTo(div, {top: scrollTop})
    expect(div!.scrollTop).not.toBe(scrollTop)

    div.remove()
  })

  test('smooth', async () => {
    const div = document.createElement('div')
    Object.defineProperties(div, {
      clientWidth: {value: 100},
      scrollWidth: {value: 1000},
      clientHeight: {value: 100},
      scrollHeight: {value: 1000},
    })
    document.body.appendChild(div)
    await scrollTo(div, {behavior: 'smooth', left: 100, top: 100})
    expect([div.scrollLeft, div.scrollTop]).toEqual([100, 100])
    await scrollTo(div, {behavior: 'smooth', left: 50})
    expect([div.scrollLeft, div.scrollTop]).toEqual([50, 100])
    await scrollTo(div, {behavior: 'smooth', top: 50})
    expect([div.scrollLeft, div.scrollTop]).toEqual([50, 50])
    await scrollTo(div, {behavior: 'smooth', left: 50, top: 50})
    expect([div.scrollLeft, div.scrollTop]).toEqual([50, 50])
    div.remove()
  })
})

describe('scrollIntoView', () => {
  let unpolyfill: Uninstall
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
    failValues.forEach((value) => {
      // @ts-expect-error not assignable
      expect(() => scrollingElement.scrollIntoView(value)).not.toThrow(
        TypeError
      )
    })
  })

  test('detached', async () => {
    const div = document.createElement('div')
    const scrollTop = 1000
    scrollingElement!.scrollTop = scrollTop

    scrollIntoView(div, {inline: 'start'})
    expect(scrollingElement!.scrollTop).toBe(scrollTop)

    document.body.appendChild(div)
    scrollIntoView(div, {inline: 'start'})
    expect(scrollingElement!.scrollTop).not.toBe(scrollTop)

    div.remove()
  })
})
