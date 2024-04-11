import { getCategoryField, getFiltersCount0, filterFieldsById } from './fields.js'

/* global describe, expect, test */

describe('getCategoryField', () => {
  test('valid cat', () => {
    expect(getCategoryField('trim')).toMatchObject({ id: 'trim' })
  })
  test('invalid cat', () => {
    expect(getCategoryField('foo')).toMatchObject({ id: 'any' })
  })
})
describe('filterFieldsById', () => {
  test('appCode', () => {
    expect(filterFieldsById.appCode.id).toBe('appCode')
  })
})
describe('getFiltersCount0', () => {
  test('simple struct', () => {
    expect(getFiltersCount0()).toMatchObject({
      appCode: {
        rg: 0,
        dl: 0,
      },
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
