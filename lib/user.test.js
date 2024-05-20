import { checkUserId, isUserId, toUid } from '../index.js'
/* global describe, expect, test */

describe('toUid', () => {
  test('pad left', () => {
    expect(toUid(100)).toBe('000100')
    expect(toUid('')).toBe('000000')
    expect(toUid(null)).toBe('000000')
    expect(toUid('00100')).toBe('000100')
  })
  test('trim', () => {
    expect(toUid('000000100')).toBe('000100')
  })
  test('bad prefix', () => {
    expect(toUid('00-00:00100')).toBe('000100')
  })
  test('o for 0', () => {
    expect(toUid('O1O0')).toBe('000100')
  })
})
describe('checkUserId', () => {
  test('invalid', () => {
    expect(checkUserId(100)).toEqual({
      valid: false,
      value: 100,
    })
    expect(checkUserId('2900')).toEqual({
      valid: false,
      value: '2900',
    })
  })
  test('valid', () => {
    expect(checkUserId(23972)).toEqual({
      valid: true,
      value: '023972',
    })
    expect(checkUserId('-000029000')).toEqual({
      valid: true,
      value: '029000',
    })
  })
})
describe('isUserId', () => {
  test('detects valid', () => {
    expect(isUserId('024063')).toBe(true)
    expect(isUserId('042244')).toBe(true)
    expect(isUserId('024032')).toBe(true)
    expect(isUserId('058956')).toBe(true)
  })
  test('too short', () => {
    expect(isUserId('1234')).toBe(false)
  })
  test('too long', () => {
    expect(isUserId('1234567')).toBe(false)
  })
  test('starts with non-zero', () => {
    expect(isUserId('123456')).toBe(false)
  })
  test('too small', () => {
    expect(isUserId('018956')).toBe(false)
  })
  test('too large', () => {
    expect(isUserId('068956')).toBe(false)
  })
})
