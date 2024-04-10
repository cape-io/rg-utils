import { getCategory, getFiltersCount0 } from './fields.js'

/* global describe, expect, test */

describe('getCategory', () => {
  test('valid cat', () => {
    expect(getCategory('trim')).toMatchObject({ id: 'trim' })
  })
})

describe('getFiltersCount0', () => {
  test('simple struct', () => {
    expect(getFiltersCount0()).toMatchObject({
      colors: {
        black: 0,
      },
      contents: {
        linen: 0,
      },
      designs: {
        brush: 0,
      },
      category: {
        textile: 0,
      },
    })
  })
})
