import React, {useRef, useEffect, useState} from 'react'
/** @jsx jsx */
import {jsx, Global} from '@emotion/react'
import install from '../index'

const Cell = ({children, ...props}) => (
  <div
    css={{
      width: 200,
      height: 200,
      padding: 20,
      flexShrink: 0,
      textAlign: 'center',
      fontSize: '5em',
      boxSizing: 'border-box',
    }}
    {...props}
  >
    <div
      css={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'whitesmoke',
      }}
    >
      {children}
    </div>
  </div>
)

// https://leaverou.github.io/css3patterns/#arrows
const arrowPatternStyle = {
  background: `
      linear-gradient(45deg, #92baac 45px, transparent 45px) 64px 64px,
      linear-gradient(45deg, #92baac 45px, transparent 45px, transparent 91px, #e1ebbd 91px, #e1ebbd 135px, transparent 135px),
      linear-gradient(-45deg, #92baac 23px, transparent 23px,transparent 68px,#92baac 68px,#92baac 113px,transparent 113px,transparent 158px,#92baac 158px)
    `,
  backgroundColor: '#e1ebbd',
  backgroundSize: '128px 128px',
}

const getRelativeOffset = (element, offsetParent) => {
  const bcr = element.getBoundingClientRect()
  const baseBcr = offsetParent.getBoundingClientRect()
  return {
    left: bcr.left - baseBcr.left,
    top: bcr.top - baseBcr.top,
  }
}

export default () => {
  const scrollerRef = useRef()
  const gridRef = useRef()
  const [behavior, setBehavior] = useState('smooth')
  const [polyfillMode, setPolyfillMode] = useState('force')
  const [block, setBlock] = useState('center')
  const [inline, setInline] = useState('center')

  useEffect(() => {
    if (polyfillMode !== 'off') {
      return install({force: polyfillMode === 'force'})
    }
  }, [polyfillMode])

  useEffect(() => {
    cellScrollIntoView(5)
  }, [])

  const cellScrollIntoView = (number) => {
    gridRef.current.children[number - 1].scrollIntoView({
      behavior,
      block,
      inline,
    })
  }

  const cellScrollTo = (number) => {
    scrollerRef.current.scrollIntoView({block: 'center', inline: 'center'})
    const cell = gridRef.current.children[number - 1]
    scrollerRef.current.scrollTo({
      behavior,
      left: cell.offsetLeft,
      top: cell.offsetTop,
    })
  }

  return (
    <div>
      <Global
        styles={{
          body: {
            ...arrowPatternStyle,
            width: '400vw',
            height: '800vh',
          },
          ':root': {
            '--theme-ui-colors-text': '#222',
            '--theme-ui-colors-border': 'transparent',
            '--theme-ui-colors-background': 'transparent',
            '--theme-ui-colors-header-bg': 'transparent',
            '--theme-ui-colors-sidebar-bg': 'transparent',
          },
        }}
      />

      <div
        ref={scrollerRef}
        css={{
          position: 'relative',
          marginTop: 500,
          width: 400,
          height: 400,
          overflow: 'auto',
          //   TODO: compute-scroll-into-view bug
          //   border: '40px solid',
          background: 'gray',
        }}
      >
        <div
          ref={gridRef}
          css={{
            width: 200 * 3,
            padding: 20,
            display: 'flex',
            flexWrap: 'wrap',
          }}
        >
          {[...Array(12).keys()].map((n) => (
            <Cell key={n}>{n + 1}</Cell>
          ))}
        </div>
      </div>

      <div
        css={{
          position: 'fixed',
          right: 0,
          top: 80,
          padding: '.5em .8em',
          maxWidth: 400,
          background: 'rgba(0, 0, 0, .2)',
          button: {display: 'block'},
        }}
      >
        <section>
          <div>
            polyfill:
            <br />
            <label>
              <input
                type="radio"
                name="polyfillMode"
                value="default"
                checked={polyfillMode === 'default'}
                onChange={(e) => {
                  setPolyfillMode(e.target.value)
                }}
              />{' '}
              default
            </label>
            <label>
              <input
                type="radio"
                name="polyfillMode"
                value="force"
                checked={polyfillMode === 'force'}
                onChange={(e) => {
                  setPolyfillMode(e.target.value)
                }}
              />{' '}
              force
            </label>
            <label>
              <input
                type="radio"
                name="polyfillMode"
                value="off"
                checked={polyfillMode === 'off'}
                onChange={(e) => {
                  setPolyfillMode(e.target.value)
                }}
              />{' '}
              off
            </label>
          </div>
          <div>
            behavior:
            <br />
            <label>
              <input
                type="radio"
                name="behavior"
                value="smooth"
                checked={behavior === 'smooth'}
                onChange={(e) => {
                  setBehavior(e.target.value)
                }}
              />{' '}
              smooth
            </label>
            <label>
              <input
                type="radio"
                name="behavior"
                value="auto"
                checked={behavior === 'auto'}
                onChange={(e) => {
                  setBehavior(e.target.value)
                }}
              />{' '}
              auto
            </label>
          </div>
          <h2 css={{fontsize: '1em', margin: '0'}}>
            <code>scrollIntoView(opts)</code>
          </h2>
          <div>
            block:{' '}
            <select value={block} onChange={(e) => setBlock(e.target.value)}>
              <option value="nearest" checked={block === 'nearest'}>
                nearest
              </option>
              <option value="center" checked={block === 'center'}>
                center
              </option>
              <option value="start" checked={block === 'start'}>
                start
              </option>
              <option value="end" checked={block === 'end'}>
                end
              </option>
            </select>{' '}
            inline:{' '}
            <select value={inline} onChange={(e) => setInline(e.target.value)}>
              <option value="nearest" checked={inline === 'nearest'}>
                nearest
              </option>
              <option value="center" checked={inline === 'center'}>
                center
              </option>
              <option value="start" checked={inline === 'start'}>
                start
              </option>
              <option value="end" checked={inline === 'end'}>
                end
              </option>
            </select>
          </div>
          {/* <button
            onClick={() => {
              //   TODO: compute-scroll-into-view bug
              //   document.scrollingElement.scrollIntoView(true)
              document.scrollingElement.scrollIntoView({
                behavior,
                block: 'start',
              })
            }}
          >
            scrollingElement start
          </button>
          <button
            onClick={() => {
              //   document.scrollingElement.scrollIntoView(false)
              document.scrollingElement.scrollIntoView({
                behavior,
                block: 'end',
              })
            }}
          >
            scrollingElement end
          </button>
          <button
            onClick={() => {
              document.scrollingElement.scrollIntoView({
                behavior,
                block: 'center',
                inline: 'center',
              })
            }}
          >
            scrollingElement center
          </button> */}
          <button
            onClick={() => {
              scrollerRef.current.scrollIntoView({
                behavior,
                block,
                inline,
              })
            }}
          >
            scroller
          </button>
          <button onClick={() => cellScrollIntoView(1)}>scroller#1</button>
          <button onClick={() => cellScrollIntoView(5)}>scroller#5</button>
          <button onClick={() => cellScrollIntoView(6)}>scroller#6</button>
          <button onClick={() => cellScrollIntoView(7)}>scroller#7</button>
        </section>

        <section>
          <h2 css={{fontsize: '1em', margin: '0'}}>
            <code>scroll(opts)</code>
          </h2>
          <button
            onClick={() => {
              document.scrollingElement.scrollTo({
                behavior,
                top: 0,
              })
            }}
          >
            page#top
          </button>
          <button
            onClick={() => {
              document.scrollingElement.scrollTo({
                behavior,
                top: document.scrollingElement.scrollHeight / 2,
              })
            }}
          >
            page#center
          </button>
          <button
            onClick={() => {
              document.scrollingElement.scrollTo({
                behavior,
                top: document.scrollingElement.scrollHeight,
              })
            }}
          >
            page#bottom
          </button>
          {/* <button
            onClick={() => {
              const scroller = scrollerRef.current
              const {left, top} = getRelativeOffset(
                scroller,
                document.scrollingElement
              )
              document.scrollingElement.scrollTo({
                behavior,
                left,
                top,
              })
            }}
          >
            scroller
          </button> */}
          <button onClick={() => cellScrollTo(1)}>scroller#1</button>
          <button onClick={() => cellScrollTo(5)}>scroller#5</button>
          <button onClick={() => cellScrollTo(6)}>scroller#6</button>
          <button onClick={() => cellScrollTo(7)}>scroller#7</button>
        </section>

        <section>
          <h2 css={{fontsize: '1em', margin: '0'}}>
            <code>scrollBy(opts)</code>
          </h2>
          <button
            onClick={() => {
              document.scrollingElement.scrollBy({
                behavior,
                top: -1000,
              })
            }}
          >
            page top -1000
          </button>
          <button
            onClick={() => {
              document.scrollingElement.scrollBy({
                behavior,
                top: 1000,
              })
            }}
          >
            page top +1000
          </button>
          <button
            onClick={() => {
              document.scrollingElement.scrollBy({
                behavior,
                left: -1000,
              })
            }}
          >
            page left -1000
          </button>
          <button
            onClick={() => {
              document.scrollingElement.scrollBy({
                behavior,
                left: 1000,
              })
            }}
          >
            page left +1000
          </button>
          <button
            onClick={() => {
              document.scrollingElement.scrollBy({
                behavior,
                left: 1000,
                top: 1000,
              })
            }}
          >
            page top +1000, left +1000
          </button>
          <button
            onClick={() => {
              scrollerRef.current.scrollIntoView({
                block: 'center',
                inline: 'center',
              })
              scrollerRef.current.scrollBy({
                behavior,
                left: 100,
                top: 100,
              })
            }}
          >
            scroller top +100, left +100
          </button>
        </section>
      </div>
    </div>
  )
}
