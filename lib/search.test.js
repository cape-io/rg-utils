import { checkValThunk } from './search.js'

/* global describe, expect, test */

describe('checkValThunk', () => {
  test('valid values', () => {
    expect(checkValThunk(['17'])(['17', '18'])).toBe(true)
    expect(checkValThunk('17')(['17', '18'])).toBe(true)
  })
  test('no values match', () => {
    expect(checkValThunk(['16'])(['17', '18'])).toBe(false)
    expect(checkValThunk('15')(['17', '18'])).toBe(false)
  })
})
