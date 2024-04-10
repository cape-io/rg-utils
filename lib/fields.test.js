import { getCategoryField, getFiltersCount0 } from './fields.js'

/* global describe, expect, test */

describe('getCategoryField', () => {
  test('valid cat', () => {
    expect(getCategoryField('trim')).toMatchObject({ id: 'trim' })
  })
  test('invalid cat', () => {
    expect(getCategoryField('foo')).toMatchObject({ id: 'any' })
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
