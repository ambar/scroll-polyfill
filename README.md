# scroll-polyfill

[![Coverage Status](https://coveralls.io/repos/github/ambar/scroll-polyfill/badge.svg?branch=master)](https://coveralls.io/github/ambar/scroll-polyfill?branch=master)
[![npm version](https://badgen.net/npm/v/scroll-polyfill)](https://www.npmjs.com/package/scroll-polyfill)
![](https://badgen.net/npm/types/scroll-polyfill)

Scroll options polyfill:

- Add [`ScrollToOptions`](https://developer.mozilla.org/en-US/docs/Web/API/ScrollToOptions) polyfill for `Element.protype.{scroll|scrollTo|scrollBy}`, `window.{scroll|scrollTo|scrollBy}`
- Add [`ScrollIntoViewOptions`](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollInToView) polyfill for `Element.prototype.scrollIntoView`
- Smooth spring-based scrolling

## Install

```bash
npm install scroll-polyfill
```

## Usage

### Polyfill

```js
import 'scroll-polyfill/auto'

// OR:
import scrollPolyfill from 'scroll-polyfill'

scrollPolyfill()

// or you can force the polyfill (skiping feature detection)
scrollPolyfill({force: true})

// use ScrollToOptions
window.scroll({behavior: 'smooth', left: 100, top: 100})
scroller.scrollBy({behavior: 'smooth', top: 100})

// use ScrollIntoViewOptions
scrollerChild.scrollIntoView({
  behavior: 'smooth',
  block: 'nearest',
  inline: 'start',
})
document.body.scrollIntoView(false)
```

### [Ponyfill](https://ponyfill.com/)

These methods have smooth spring-based scrolling and are recommended even if polyfill is not installed:

```js
import {scrollTo, scrollBy, scrollIntoView} from 'scroll-polyfill'

scrollTo(window, {behavior: 'smooth', top: 100})
scrollBy(document.scrollingElement, {behavior: 'smooth', top: 100})
scrollIntoView(scrollerChild, {
  behavior: 'smooth',
  block: 'nearest',
  inline: 'start',
})
```
