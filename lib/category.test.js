import {
  isLeather, isTextile, isTrim, includesLeather,
} from './category.js'
import { getItemIdParts } from './id.js'

/* global describe, expect, test */

describe('isTextile', () => {
  test('valid textile id', () => {
    expect(isTextile({ patternId: '9702' })).toBe(true)
    expect(isTextile({ patternId: '9300010' })).toBe(true)
    expect(isTextile({ patternId: '945026' })).toBe(true)
  })
  test('invalid textile id', () => {
    expect(isTextile({ patternId: 'dli1001' })).toBe(false)
    expect(isTextile({ patternId: 'p-1001' })).toBe(false)
    expect(isTextile({ patternId: 'l-1001' })).toBe(false)
    expect(isTextile({ patternId: 'pf001-10' })).toBe(false)
    expect(isTextile({ patternId: 'dl1001' })).toBe(false)
    expect(isTextile({ patternId: 'dl-1001' })).toBe(false)
    expect(isTextile({ patternId: 'dl8001-01' })).toBe(false)
  })
  test('trust category over pattern id', () => {
    expect(isTextile({ category: 'texti', patternId: 'dli1001' })).toBe(true)
    expect(isTextile({ category: 'texti', patternId: 'pf001' })).toBe(true)
    expect(isTextile({ category: 'leathr', patternId: 'pf001' })).toBe(false)
  })
})
describe('isTrim', () => {
  test('valid trim id', () => {
    expect(isTrim({ patternId: 'p-1001' })).toBe(true)
    expect(isTrim({ patternId: 'dlt105' })).toBe(true)
    expect(isTrim(getItemIdParts('dlt105-05'))).toBe(true)
  })
  test('invalid trim id', () => {
    expect(isTrim({ patternId: '009' })).toBe(false)
  })
})
describe('isLeather', () => {
  test('valid leather name', () => {
    expect(isLeather({ name: 'Outdoor Leather' })).toBe(true)
  })
  test('valid leather category', () => {
    expect(isLeather({ category: 'leather' })).toBe(true)
    expect(isLeather({ category: 'leathr', patternId: 'pf001' })).toBe(true)
  })
})
describe('includesLeather', () => {
  test('valid leather', () => {
    expect(includesLeather('leather')).toBe(true)
    expect(includesLeather('Outdoor leather')).toBe(true)
  })
})
