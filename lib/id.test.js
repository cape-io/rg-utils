import {
  hasValidIdChars, idStrPrep, isPatternPart, getItemIdParts, validIdChars,
} from './id.js'

/* global describe, expect, test */
describe('idStrPrep', () => {
  test('underscore to hyphen', () => {
    expect(idStrPrep('01|02')).toEqual('01-02')
    expect(idStrPrep('01_02')).toEqual('01-02')
  })
})

describe('validIdChars', () => {
  test('valid itemId', () => {
    expect([...validIdChars.exec('710014-01')]).toEqual(['710014-01'])
  })
  test('invalid itemId', () => {
    expect(validIdChars.exec('s710014-01')).toBe(null)
    expect(validIdChars.exec('014-01')).toBe(null)
  })
})
describe('hasValidIdChars', () => {
  test('valid itemId', () => {
    expect(hasValidIdChars('710014-01')).toBe(true)
  })
  test('invalid itemId', () => {
    expect(hasValidIdChars('s710014-01')).toBe(false)
    expect(hasValidIdChars('014-01')).toBe(false)
  })
})
describe('isPatternPart', () => {
  test('basic pattern parts', () => {
    expect(isPatternPart('710014')).toBe(true)
    expect(isPatternPart('014')).toBe(false)
    expect(isPatternPart('0014')).toBe(true)
    expect(isPatternPart('0100')).toBe(true)
  })
  test('single letter part', () => {
    expect(isPatternPart('p')).toBe(true)
    expect(isPatternPart('r')).toBe(false)
  })
})

describe('getItemIdParts', () => {
  test('basic item id', () => {
    expect(getItemIdParts('710014-01')).toEqual({
      patternId: '710014',
      colorId: '01',
    })
  })
  test('trim id', () => {
    expect(getItemIdParts('P-1120-14')).toEqual({
      patternId: 'p-1120',
      colorId: '14',
    })
  })
  test('dl item', () => {
    expect(getItemIdParts('DL5002-16-17')).toEqual({
      patternId: 'dl5002',
      colorId: '16|17',
    })
    expect(getItemIdParts('Dl1015-06|07')).toEqual({
      patternId: 'dl1015',
      colorId: '06|07',
    })
  })
  test('leather', () => {
    expect(getItemIdParts('l-1001-12')).toEqual({
      patternId: 'l-1001',
      colorId: '12',
    })
  })
  test('invalid', () => {
    expect(getItemIdParts('toRrent_sAnd-ebOny')).toEqual({
      invalidId: true,
      colorId: null,
      patternId: null,
      otherId: 'torrent_sand_ebony',
    })
    expect(getItemIdParts('945005-03_L')).toEqual({
      invalidId: true,
      colorId: '03',
      patternId: '945005',
      otherId: 'l',
    })
    expect(getItemIdParts('P-0103-13-big')).toEqual({
      invalidId: true,
      patternId: 'p-0103',
      colorId: '13',
      otherId: 'big',
    })
    expect(getItemIdParts('d-p-0103-13-big')).toEqual({
      invalidId: true,
      patternId: null,
      colorId: '13',
      otherId: 'd_p_0103_big',
    })
    expect(getItemIdParts('p-01d03-13')).toEqual({
      invalidId: true,
      patternId: null,
      colorId: '13',
      otherId: 'p_01d03',
    })
  })
})
