import { isTextile } from './category.js'

/* global describe, expect, test */

describe('isTextile', () => {
  test('valid textile id', () => {
    expect(isTextile({ patternId: 'dl1001' })).toBe(true)
    expect(isTextile({ patternId: 'dl-1001' })).toBe(true)
  })
  test('invalid textile id', () => {
    expect(isTextile({ patternId: 'dli1001' })).toBe(false)
    expect(isTextile({ patternId: 'p-1001' })).toBe(false)
    expect(isTextile({ patternId: 'l-1001' })).toBe(false)
  })
  test('trust category over pattern id', () => {
    expect(isTextile({ category: 'texti', patternId: 'dli1001' })).toBe(true)
  })
})
