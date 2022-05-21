import { getNumberFromPrefix } from './cat-ids.js'

/* global describe, expect, test */

describe('getNumberFromPrefix', () => {
  test('valid trim id', () => {
    expect(getNumberFromPrefix(null)).toBe(0)
    expect(getNumberFromPrefix('p')).toBe(3)
  })
})
