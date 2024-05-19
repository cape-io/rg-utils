import { isAppCode } from '../index.js'
/* global describe, expect, test */

describe('isAppCode', () => {
  test('valid appCodes', () => {
    expect(isAppCode('rg')).toBe(true)
    expect(isAppCode('dl')).toBe(true)
  })
  test('bad appCodes', () => {
    expect(isAppCode('ds1')).toBe(false)
    expect(isAppCode('23')).toBe(false)
  })
})
