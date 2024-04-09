import { getCategory } from './fields.js'

/* global describe, expect, test */

describe('getCategory', () => {
  test('valid cat', () => {
    expect(getCategory('trim')).toMatchObject({ id: 'trim' })
  })
})
