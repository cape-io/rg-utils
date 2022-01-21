import { hasValidIdChars, isPatternPart, getItemIdParts, validIdChars } from './rg-id.js'

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
    expect(isPatternPart('0014')).toBe(false)
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
      colorId: '16-17',
    })
  })
  test('leather', () => {
    expect(getItemIdParts('l-1001-12')).toEqual({
      patternId: 'l-1001',
      colorId: '12',
    })
  })
  test('invalid', () => {
    expect(getItemIdParts('torrent_sand-ebony')).toEqual({})
    expect(getItemIdParts('945005-03_L')).toEqual({})
  })
})
