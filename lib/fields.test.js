import {
  fieldById,
  getCategoryField, getFiltersCount0, filterFieldsById, toOptCodeSearch, toOptIdSearch,
} from './fields.js'

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
describe('fieldById', () => {
  test('contents', () => {
    expect(fieldById.contents).toMatchObject({
      id: 'contents',
    })
    expect(fieldById.contents.options[0]).toEqual({
      code: 'ay',
      id: 'acrylic',
      index: 0,
      label: 'Acrylic',
    })
  })
})
describe('toOptCodeSearch', () => {
  test('basic', () => {
    expect(toOptCodeSearch({ colors: ['black'], contents: ['linen'] })).toEqual({
      cs: ['bk'],
      ct: ['ln'],
    })
  })
  test('invalid value id', () => {
    expect(toOptCodeSearch({ colors: ['foo'] })).toEqual({})
  })
})
describe('toOptIdSearch', () => {
  test('category array to categoryId', () => {
    expect(toOptIdSearch({ cg: ['tl'] })).toEqual({
      categoryId: 'textile',
    })
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
