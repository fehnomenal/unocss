import type { CSSValueInput, Rule, RuleContext } from '@unocss/core'
import type { Theme } from '../theme'
import { symbols } from '@unocss/core'
import { colorResolver, defineProperty, globalKeywords, h, isCSSMathFn, makeGlobalStaticRules } from '../utils'

export const outline: Rule<Theme>[] = [
  // size
  [/^outline-(?:width-|size-)?(.+)$/, handleWidth, { autocomplete: 'outline-(width|size)-<num>' }],

  // color
  [/^outline-(?:color-)?(.+)$/, handleColorOrWidth, { autocomplete: 'outline-$colors' }],
  [/^outline-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-outline-opacity': h.bracket.percent.cssvar(opacity) }), { autocomplete: 'outline-(op|opacity)-<percent>' }],

  // offset
  [/^outline-offset-(.+)$/, ([, d]) => ({ 'outline-offset': h.bracket.cssvar.global.px(d) }), { autocomplete: 'outline-(offset)-<num>' }],
  ['outline-offset-none', { 'outline-offset': '0' }],

  // style
  ['outline', [
    {
      'outline-style': 'var(--un-outline-style)',
      'outline-width': '1px',
    },
    defineProperty('--un-outline-style', { initialValue: 'solid' }),
  ]],
  ['outline-hidden', [
    { 'outline-style': 'none' },
    {
      [symbols.parent]: `@media (forced-colors: active)`,
      'outline': `2px solid transparent`,
      'outline-offset': `2px`,
    },
  ]],
  ['outline-none', { '--un-outline-style': 'none', 'outline-style': 'none' }],
  ...['auto', 'dashed', 'dotted', 'double', 'solid', 'groove', 'ridge', 'inset', 'outset', ...globalKeywords].map(v => [`outline-${v}`, { '--un-outline-style': v, 'outline-style': v }] as Rule<Theme>),
]

function* handleWidth([, b]: string[]): Generator<CSSValueInput | undefined> {
  const v = h.bracket.cssvar.global.px(b)
  if (v != null) {
    yield {
      'outline-style': 'var(--un-outline-style)',
      'outline-width': v,
    }
    yield defineProperty('--un-outline-style', { initialValue: 'solid' })
  }
}

function* handleColorOrWidth(match: RegExpMatchArray, ctx: RuleContext<Theme>): Generator<CSSValueInput | string | undefined> {
  if (isCSSMathFn(h.bracket(match[1]))) {
    yield* handleWidth(match)
  }
  else {
    const result = colorResolver('outline-color', 'outline')(match, ctx)
    if (result) {
      for (const i of result) {
        yield i
      }
    }
  }
}

export const appearance: Rule<Theme>[] = [
  ['appearance-auto', { '-webkit-appearance': 'auto', 'appearance': 'auto' }],
  ['appearance-none', { '-webkit-appearance': 'none', 'appearance': 'none' }],
]

function willChangeProperty(prop: string): string | undefined {
  const v = h.bracket(prop)

  if (v && h.properties(v)) {
    return v
  }

  return h.properties.auto.cssvar.global(prop) ?? {
    contents: 'contents',
    scroll: 'scroll-position',
  }[prop]
}

export const willChange: Rule<Theme>[] = [
  [/^will-change-(.+)/, ([, p]) => ({ 'will-change': willChangeProperty(p) })],
]

const listStyles: Record<string, string> = {
  'disc': 'disc',
  'circle': 'circle',
  'square': 'square',
  'decimal': 'decimal',
  'zero-decimal': 'decimal-leading-zero',
  'greek': 'lower-greek',
  'roman': 'lower-roman',
  'upper-roman': 'upper-roman',
  'alpha': 'lower-alpha',
  'upper-alpha': 'upper-alpha',
  'latin': 'lower-latin',
  'upper-latin': 'upper-latin',
}

export const listStyle: Rule<Theme>[] = [
  // base
  [/^list-(.+?)(?:-(outside|inside))?$/, ([, alias, position]) => {
    const style = listStyles[alias]
    if (style) {
      if (position) {
        return {
          'list-style-position': position,
          'list-style-type': style,
        }
      }
      return { 'list-style-type': style }
    }
  }, { autocomplete: [`list-(${Object.keys(listStyles).join('|')})`, `list-(${Object.keys(listStyles).join('|')})-(outside|inside)`] }],
  // styles
  ['list-outside', { 'list-style-position': 'outside' }],
  ['list-inside', { 'list-style-position': 'inside' }],
  ['list-none', { 'list-style-type': 'none' }],
  // image
  [/^list-image-(.+)$/, ([, d]) => {
    if (/^\[url\(.+\)\]$/.test(d))
      return { 'list-style-image': h.bracket(d) }
  }],
  ['list-image-none', { 'list-style-image': 'none' }],
  ...makeGlobalStaticRules('list', 'list-style-type'),
]

export const accents: Rule<Theme>[] = [
  [/^accent-(.+)$/, colorResolver('accent-color', 'accent'), { autocomplete: 'accent-$colors' }],
  [/^accent-op(?:acity)?-?(.+)$/, ([, d]) => ({ '--un-accent-opacity': h.bracket.percent(d) }), { autocomplete: ['accent-(op|opacity)', 'accent-(op|opacity)-<percent>'] }],
]

export const carets: Rule<Theme>[] = [
  [/^caret-(.+)$/, colorResolver('caret-color', 'caret'), { autocomplete: 'caret-$colors' }],
  [/^caret-op(?:acity)?-?(.+)$/, ([, d]) => ({ '--un-caret-opacity': h.bracket.percent(d) }), { autocomplete: ['caret-(op|opacity)', 'caret-(op|opacity)-<percent>'] }],
]

export const imageRenderings: Rule<Theme>[] = [
  ['image-render-auto', { 'image-rendering': 'auto' }],
  ['image-render-edge', { 'image-rendering': 'crisp-edges' }],
  ['image-render-pixel', [
    ['-ms-interpolation-mode', 'nearest-neighbor'],
    ['image-rendering', '-webkit-optimize-contrast'],
    ['image-rendering', '-moz-crisp-edges'],
    ['image-rendering', '-o-pixelated'],
    ['image-rendering', 'pixelated'],
  ]],
]

export const overscrolls: Rule<Theme>[] = [
  ['overscroll-auto', { 'overscroll-behavior': 'auto' }],
  ['overscroll-contain', { 'overscroll-behavior': 'contain' }],
  ['overscroll-none', { 'overscroll-behavior': 'none' }],
  ...makeGlobalStaticRules('overscroll', 'overscroll-behavior'),
  ['overscroll-x-auto', { 'overscroll-behavior-x': 'auto' }],
  ['overscroll-x-contain', { 'overscroll-behavior-x': 'contain' }],
  ['overscroll-x-none', { 'overscroll-behavior-x': 'none' }],
  ...makeGlobalStaticRules('overscroll-x', 'overscroll-behavior-x'),
  ['overscroll-y-auto', { 'overscroll-behavior-y': 'auto' }],
  ['overscroll-y-contain', { 'overscroll-behavior-y': 'contain' }],
  ['overscroll-y-none', { 'overscroll-behavior-y': 'none' }],
  ...makeGlobalStaticRules('overscroll-y', 'overscroll-behavior-y'),
]

export const scrollBehaviors: Rule<Theme>[] = [
  ['scroll-auto', { 'scroll-behavior': 'auto' }],
  ['scroll-smooth', { 'scroll-behavior': 'smooth' }],
  ...makeGlobalStaticRules('scroll', 'scroll-behavior'),
]
