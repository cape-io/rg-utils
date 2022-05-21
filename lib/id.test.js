import {
  getItemIdParts, getItemIdInfo, splitItemId,
  hasValidIdFormat, idStrPrep, isPatternPart, isValidPattern, isValidPatternNumber,
  hasValidPatternFormat,
  patternIsTextile, prepColorParts, validIdChars,
  numberToPrefix, prefixToNumber, toArchiveId, fromArchiveId,
} from './id.js'

/* global describe, expect, test */

describe('isValidPatternNumber', () => {
  test('valid patterns', () => {
    expect(isValidPatternNumber('1120')).toBe(true)
  })
})
describe('prefixToNumber', () => {
  test('basic patterns', () => {
    expect(prefixToNumber({ patternPrefix: 'p', patternSeparator: true })).toBe(3)
    expect(prefixToNumber({ patternPrefix: 'p', patternSeparator: false })).toBe(19)
  })
})
describe('numberToPrefix', () => {
  test('basic patterns', () => {
    expect(numberToPrefix(3)).toEqual({ patternPrefix: 'p', patternSeparator: true })
    expect(numberToPrefix(19)).toEqual({ patternPrefix: 'p', patternSeparator: false })
  })
})
describe('toArchiveId', () => {
  test('basic patterns', () => {
    expect(toArchiveId('p-710014-01')).toBe('A3-NNBY-1')
    expect(toArchiveId('dl5002-16|17')).toBe('AM-4WA-40H')
    expect(toArchiveId('l-1001-12')).toBe('A2-Z9-C')
    expect(toArchiveId('710014-01')).toBe('A0-NNBY-1')
    expect(toArchiveId('938034-11')).toBe('A0-WM1J-B')
    expect(toArchiveId('dli0010-01')).toBe('AN-A-1')
  })
})
describe('fromArchiveId', () => {
  test('basic patterns', () => {
    expect(fromArchiveId('A3-NnBy-l').itemId).toBe('p-710014-01')
    expect(fromArchiveId('Am-4wA-40H').itemId).toBe('dl5002-16|17')
    expect(fromArchiveId('a2-z9-C').itemId).toBe('l-1001-12')
    expect(fromArchiveId('A0-NNBY-1').itemId).toBe('710014-01')
  })
})

describe('getItemIdInfo', () => {
  test('basic patterns', () => {
    expect(getItemIdInfo('A0-Wmij-B')).toEqual({
      input: 'A0-Wmij-B',
      patternId: '938034',
      colorId: '11',
      patternNumber: 938034,
      patternPrefix: null,
      itemId: '938034-11',
      patternSeparator: false,
      prefixCategory: 'textile',
    })
  })
})
describe('hasValidPatternFormat', () => {
  test('valid patterns', () => {
    expect(hasValidPatternFormat('dl710014')).toBe(true)
    expect(hasValidPatternFormat('0001')).toBe(true)
    expect(hasValidPatternFormat('p-100')).toBe(true)
  })
  test('invalid patterns', () => {
    expect(hasValidPatternFormat(null)).toBe(false)
    expect(hasValidPatternFormat(undefined)).toBe(false)
    expect(hasValidPatternFormat('kai')).toBe(false)
    expect(hasValidPatternFormat('p-01')).toBe(false)
  })
})
describe('splitItemId', () => {
  test('split with no dash', () => {
    expect(splitItemId('dl710014')).toEqual(['dl', '710014'])
    expect(splitItemId('pf2001')).toEqual(['pf', '2001'])
  })
  test('split with dash', () => {
    expect(splitItemId('p-0010')).toEqual(['p', '0010'])
    expect(splitItemId('dl5002-16-17')).toEqual(['dl', '5002', '16', '17'])
  })
})
describe('isValidPattern', () => {
  test('valid patterns', () => {
    expect(isValidPattern('dl710014')).toBe(true)
    expect(isValidPattern('p-0010')).toBe(true)
  })
  test('invalid patterns', () => {
    expect(isValidPattern(null)).toBe(false)
    expect(isValidPattern(undefined)).toBe(false)
    expect(isValidPattern('0001')).toBe(false)
    expect(isValidPattern('kai')).toBe(false)
    expect(isValidPattern('p-01')).toBe(false)
  })
})
describe('idStrPrep', () => {
  test('underscore to hyphen', () => {
    expect(idStrPrep('01|02')).toEqual('01-02')
    expect(idStrPrep('01_02')).toEqual('01-02')
  })
})
describe('prepColorParts', () => {
  test('leave correct colorId along', () => {
    expect(prepColorParts('01')).toBe('01')
    expect(prepColorParts('10')).toBe('10')
  })
  test('strip extra 0 at start', () => {
    expect(prepColorParts('001')).toBe('01')
    expect(prepColorParts('010')).toBe('10')
  })
  test('pad 0 at start of num', () => {
    expect(prepColorParts('1')).toBe('01')
  })
  test('no pad or strip when not num', () => {
    expect(prepColorParts('0b0')).toBe('0b0')
    expect(prepColorParts('b0')).toBe('b0')
    expect(prepColorParts('0b')).toBe('0b')
  })
})
describe('patternIsTextile', () => {
  test('2 numbers invalid', () => {
    expect(patternIsTextile('10')).toBe(false)
  })
  test('3 numbers valid', () => {
    expect(patternIsTextile('010')).toBe(true)
  })
  test('4 numbers or more are valid', () => {
    expect(patternIsTextile('0010')).toBe(true)
    expect(patternIsTextile('00100')).toBe(true)
    expect(patternIsTextile('01094402')).toBe(true)
  })
  test('removes dl prefix', () => {
    expect(patternIsTextile('dl1001')).toBe(true)
  })
})
describe('validIdChars', () => {
  test('valid itemId', () => {
    expect([...validIdChars.exec('p-710014-01')]).toEqual(['p-710014-01'])
    expect([...validIdChars.exec('710014-01')]).toEqual(['710014-01'])
    expect(validIdChars.exec('dl710014-01')[0]).toEqual('dl710014-01')
    expect(validIdChars.exec('dl-710014-01')[0]).toEqual('dl-710014-01')
    expect(validIdChars.exec('dli710014-01')[0]).toEqual('dli710014-01')
    expect(validIdChars.exec('dli-710014-01')[0]).toEqual('dli-710014-01')
    expect(validIdChars.exec('dlt105-01')[0]).toEqual('dlt105-01')
    expect(validIdChars.exec('014-01')[0]).toBe('014-01')
  })
  test('invalid itemId', () => {
    expect(validIdChars.exec('s710014-01')).toBe(null)
    expect(validIdChars.exec('14-01')).toBe(null)
  })
})
describe('hasValidIdFormat', () => {
  test('valid itemId', () => {
    expect(hasValidIdFormat('710014-01')).toBe(true)
    expect(hasValidIdFormat('p-0010-01')).toBe(true)
    expect(hasValidIdFormat('dl0010-01')).toBe(true)
    expect(hasValidIdFormat('dli0010-01')).toBe(true)
    expect(hasValidIdFormat('dlt0010-01')).toBe(true)
    expect(hasValidIdFormat('p-010-01')).toBe(true)
    expect(hasValidIdFormat('014-01')).toBe(true)
  })
  test('invalid itemId', () => {
    expect(hasValidIdFormat('dil0010-01')).toBe(false)
    expect(hasValidIdFormat('d0010-01')).toBe(false)
    expect(hasValidIdFormat('p010-01')).toBe(false)
    expect(hasValidIdFormat('14-01')).toBe(false)
    expect(hasValidIdFormat('p-0010-01_01')).toBe(false)
    expect(hasValidIdFormat('s710014-01')).toBe(false)
    expect(hasValidIdFormat('p-10-01')).toBe(false)
    expect(hasValidIdFormat('p-001a-01')).toBe(false)
    expect(hasValidIdFormat('dl0010-010')).toBe(false)
  })
})
describe('isPatternPart', () => {
  test('basic pattern parts', () => {
    expect(isPatternPart('710014')).toBe(true)
    expect(isPatternPart('014')).toBe(true)
    expect(isPatternPart('0014')).toBe(true)
    expect(isPatternPart('0100')).toBe(true)
    expect(isPatternPart('009')).toBe(false)
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
      patternPrefix: null,
      itemId: '710014-01',
      patternNumber: 710014,
      patternSeparator: false,
      prefixCategory: 'textile',
      archiveId: 'A0-NNBY-1',
    })
  })
  test('trim id', () => {
    expect(getItemIdParts('P-1120-14')).toEqual({
      input: 'P-1120-14',
      patternId: 'p-1120',
      colorId: '14',
      patternPrefix: 'p',
      itemId: 'p-1120-14',
      patternNumber: 1120,
      patternSeparator: true,
      prefixCategory: 'trim',
      archiveId: 'A3-130-E',
    })
  })
  test('dl item', () => {
    expect(getItemIdParts('DL5002-16-17')).toEqual({
      input: 'DL5002-16-17',
      patternId: 'dl5002',
      colorId: '16|17',
      patternPrefix: 'dl',
      itemId: 'dl5002-16|17',
      patternNumber: 5002,
      patternSeparator: false,
      prefixCategory: 'textile',
      archiveId: 'AM-4WA-40H',
    })
    expect(getItemIdParts('Dl1015-06|07')).toEqual({
      input: 'Dl1015-06|07',
      patternId: 'dl1015',
      colorId: '06|07',
      patternPrefix: 'dl',
      itemId: 'dl1015-06|07',
      patternNumber: 1015,
      patternSeparator: false,
      prefixCategory: 'textile',
      archiveId: 'AM-ZQ-1G7',
    })
    expect(getItemIdParts('dl5002-16-17')).toEqual({
      input: 'dl5002-16-17',
      patternId: 'dl5002',
      colorId: '16|17',
      patternPrefix: 'dl',
      itemId: 'dl5002-16|17',
      patternNumber: 5002,
      patternSeparator: false,
      prefixCategory: 'textile',
      archiveId: 'AM-4WA-40H',
    })
    expect(getItemIdParts('dli2001-16')).toEqual({
      patternId: 'dli2001',
      colorId: '16',
      patternPrefix: 'dli',
      itemId: 'dli2001-16',
      patternNumber: 2001,
      patternSeparator: false,
      prefixCategory: 'linen',
      archiveId: 'AN-1YH-G',
    })
    expect(getItemIdParts('dli-2001-16')).toEqual({
      patternId: 'dli-2001',
      colorId: '16',
      patternPrefix: 'dli',
      itemId: 'dli-2001-16',
      patternNumber: 2001,
      patternSeparator: true,
      prefixCategory: 'linen',
      archiveId: 'A5-1YH-G',
    })
    expect(getItemIdParts('dlt105-05')).toEqual({
      patternId: 'dlt105',
      colorId: '05',
      patternPrefix: 'dlt',
      itemId: 'dlt105-05',
      patternNumber: 105,
      patternSeparator: false,
      prefixCategory: 'trim',
      archiveId: 'AQ-39-5',
    })
  })
  test('leather', () => {
    expect(getItemIdParts('l-1001-12')).toEqual({
      patternId: 'l-1001',
      colorId: '12',
      patternPrefix: 'l',
      itemId: 'l-1001-12',
      patternNumber: 1001,
      patternSeparator: true,
      prefixCategory: 'leather',
      archiveId: 'A2-Z9-C',
    })
  })
  test('extra start 0', () => {
    expect(getItemIdParts('938034-011')).toEqual({
      input: '938034-011',
      patternId: '938034',
      colorId: '11',
      // invalidId: true,
      patternPrefix: null,
      itemId: '938034-11',
      patternNumber: 938034,
      patternSeparator: false,
      prefixCategory: 'textile',
      archiveId: 'A0-WM1J-B',
    })
  })
  test('invalid', () => {
    expect(getItemIdParts('toRrent_sAnd-ebOny')).toEqual({
      input: 'toRrent_sAnd-ebOny',
      invalidId: true,
      colorId: null,
      patternId: null,
      otherId: 'torrent_sand_ebony',
      patternPrefix: null,
      itemId: null,
      patternNumber: null,
      patternSeparator: false,
      prefixCategory: 'invalid',
      archiveId: null,
    })
    expect(getItemIdParts('945005-03_L')).toEqual({
      input: '945005-03_L',
      invalidId: true,
      colorId: '03',
      patternId: '945005',
      otherId: 'l',
      patternPrefix: null,
      itemId: '945005-03',
      patternNumber: 945005,
      patternSeparator: false,
      prefixCategory: 'textile',
      archiveId: null,
    })
    expect(getItemIdParts('P-0103-13-big')).toEqual({
      input: 'P-0103-13-big',
      invalidId: true,
      patternId: 'p-0103',
      colorId: '13',
      otherId: 'big',
      patternPrefix: 'p',
      itemId: 'p-0103-13',
      patternNumber: 103,
      patternSeparator: true,
      prefixCategory: 'trim',
      archiveId: null,
    })
    expect(getItemIdParts('d-p-0103-13-big')).toEqual({
      input: 'd-p-0103-13-big',
      invalidId: true,
      patternId: null,
      colorId: '13',
      otherId: 'd_p_0103_big',
      patternPrefix: null,
      itemId: null,
      patternNumber: null,
      patternSeparator: false,
      prefixCategory: 'invalid',
      archiveId: null,
    })
    expect(getItemIdParts('p-01d03-13')).toEqual({
      input: 'p-01d03-13',
      invalidId: true,
      patternId: null,
      colorId: '13',
      otherId: '01d03',
      patternPrefix: 'p',
      itemId: null,
      patternNumber: null,
      patternSeparator: true,
      prefixCategory: 'trim',
      archiveId: null,
    })
  })
})
