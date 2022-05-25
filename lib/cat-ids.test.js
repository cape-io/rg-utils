import { getNumberFromPrefix, getPrefixFromNumber } from './cat-ids.js'

/* global describe, expect, test */

describe('getNumberFromPrefix', () => {
  test('valid trim id', () => {
    expect(getNumberFromPrefix(null)).toBe(0)
    expect(getNumberFromPrefix('p')).toBe(1)
    expect(getNumberFromPrefix('l')).toBe(2)
  })
})
describe('getPrefixFromNumber', () => {
  test('valid trim id', () => {
    expect(getPrefixFromNumber(0)).toBe(null)
    expect(getPrefixFromNumber(1)).toBe('p')
    expect(getPrefixFromNumber(2)).toBe('l')
    expect(getPrefixFromNumber(0xF)).toBe('invalid')
  })
})
