# scroll-polyfill

Scroll opitons polyfill:

- Add [`ScrollToOptions`](https://developer.mozilla.org/en-US/docs/Web/API/ScrollToOptions) polyfill for `Element.protype.{scroll|scrollTo|scrollBy}`, `window.{scroll|scrollTo|scrollBy}`
- Add [`ScrollIntoViewOptions`](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollInToView) polyfill for `Element.protype.scrollIntoView`

## Install

```bash
npm install scroll-polyfill
```

## Usage

```js
import scrollPolyfill from 'scroll-polyfill'

scrollPolyfill()

// or you can force the polyfill (skiping feature detection)
scrollPolyfill({force: true})
```

Examples:

```js
// use ScrollToOptions
window.scroll({behavior: 'smooth', left: 100, top: 100})
scroller.scrollBy({behavior: 'smooth', top: 100})

// use ScrollIntoViewOptions
scrollerChild.scrollIntoView({
  behavior: 'smooth',
  block: 'nearest',
  inline: 'start',
})
```
