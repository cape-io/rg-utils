import { getCategory, filterOpts } from './fields.js'

/* global describe, expect, test */

describe('getCategory', () => {
  test('valid cat', () => {
    expect(getCategory('trim')).toMatchObject({ id: 'trim' })
  })
})
describe('filterOpts', () => {
  test('valid cat', () => {
    expect(filterOpts).toMatchObject({
      colors: {
        value: null,
        options: {
          black: { count: 0 },
          blue: { count: 0 },
        },
      },
      contents: {
        value: null,
        options: {},
      },
      designs: {
        value: null,
        options: {
          brush: { count: 0 },
        },
      },
    })
  })
})
