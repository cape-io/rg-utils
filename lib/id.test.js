import {
  fromArchiveId, fromItemNumber,
  colorPartsToNumber,
  getIdParts, getItemParts, getPartsInfo, getItemIdParts, getItemIdInfo,
  getPatternIdInfo, getPatternParts,
  getArchivePrefix,
  isColorIdNum, isItemId, idStrPrep, isPatternPart, isValidPattern, isPatternNumber,
  itemIdToNumber, numberToColor,
  patternIsTextile,
  numberToColors, numberToPrefix, prefixToNumber, toArchiveId,
  splitItemId, splitAtFirstNumber,
} from './id.js'
import { invalidIds, validIds } from '../ids.js'

/* global describe, expect, test */
describe('idStrPrep', () => {
  test('normal', () => {
    expect(idStrPrep('-dl710014')).toBe('dl710014')
    expect(idStrPrep('A0-9F6.4')).toBe('a0-9f6-4')
    expect(idStrPrep('PF7006-10')).toBe('pf7006-10')
    expect(idStrPrep('PF-001-10')).toBe('pf-001-10')
  })
  test('underscore to hyphen', () => {
    expect(idStrPrep('-01|02-')).toBe('01-02')
    expect(idStrPrep('01_03')).toBe('01-03')
    expect(idStrPrep('16|17-normal')).toEqual('16-17-normal')
  })
  test('other', () => {
    expect(idStrPrep('áb-cç*9()-foo^.&')).toBe('ab-cc9-foo')
  })
})
describe('isItemId', () => {
  test('valid patterns', () => {
    expect(isItemId('1120')).toBe(false)
  })
})
describe('getArchivePrefix', () => {
  test('valid patterns', () => {
    expect(getArchivePrefix(getItemIdInfo('1120'))).toBe('A0')
  })
  test('invalid patterns', () => {
    expect(getArchivePrefix(getItemIdInfo('r'))).toBe('AZ')
  })
})
describe('getPatternParts', () => {
  test('valid patterns', () => {
    expect(getPatternParts('1120')).toEqual({
      // length: 4,
      // source: 11,
      // style: 20,
      pattern: '1120',
      patternNumber: 1120,
    })
    expect(getPatternParts('11020')).toEqual({
      // length: 5,
      // source: 110,
      // style: 20,
      pattern: '11020',
      patternNumber: 11020,
    })
  })
})

describe('isColorIdNum', () => {
  test('valid colors', () => {
    expect(isColorIdNum('1')).toBe(true)
    expect(isColorIdNum('02')).toBe(true)
    expect(isColorIdNum('42')).toBe(true)
    expect(isColorIdNum('65')).toBe(true)
    expect(isColorIdNum('88')).toBe(true)
    expect(isColorIdNum('110')).toBe(true)
    expect(isColorIdNum('180')).toBe(true) // assume double color
    expect(isColorIdNum(1284)).toBe(true) // assume double color
  })
  test('invalid colors', () => {
    expect(isColorIdNum('0')).toBe(false)
  })
})

describe('numberToColor', () => {
  test('valid colors', () => {
    expect(numberToColor(1)).toBe('01')
  })
  test('invalid color', () => {
    expect(numberToColor(15079881)).toBe(null)
  })
})

describe('isPatternNumber', () => {
  test('valid pattern', () => {
    expect(isPatternNumber(Number('1120'))).toBe(true)
    expect(isPatternNumber(Number('02'))).toBe(true)
  })
  test('invalid pattern', () => {
    expect(isPatternNumber(Number('0'))).toBe(false)
  })
})
describe('splitAtFirstNumber', () => {
  test('valid patterns', () => {
    expect(splitAtFirstNumber('l')).toEqual(['l'])
    expect(splitAtFirstNumber('1120')).toEqual([null, '1120'])
  })
})
describe('colorPartsToNumber', () => {
  test('valid patterns', () => {
    expect(colorPartsToNumber(['17'])).toBe(17)
    expect(colorPartsToNumber(['16', '17'])).toBe(2065)
  })
})
describe('numberToColors', () => {
  test('valid patterns', () => {
    expect(numberToColors(17)).toEqual([17])
    expect(numberToColors(2065)).toEqual([16, 17])
  })
})

describe('getIdParts', () => {
  test('invalid patterns', () => {
    expect(getIdParts('PF7006-03-nOrmAl')).toEqual({
      appCode: 'rg',
      categoryId: 'textile',
      colorId: '03',
      colorNumber: 3,
      errors: [
        { message: 'Item id has extra information at the end. normal', part: 'otherId' },
      ],
      input: 'PF7006-03-nOrmAl',
      invalidId: true,
      itemId: 'pf7006-03',
      otherId: 'normal',
      patternId: 'pf7006',
      patternMinLength: 3,
      patternMinNumber: 1,
      patternNumber: 7006,
      patternPrefix: 'pf',
      patternSeparator: false,
      prefixNumber: 7,
      tag: 'performance',
    })
    expect(getIdParts('dl5002-16|17-big')).toEqual({
      appCode: 'dl',
      categoryId: 'textile',
      colorId: '16|17',
      colorNumber: 2065,
      errors: [
        { message: 'Item id has extra information at the end. big', part: 'otherId' },
      ],
      input: 'dl5002-16|17-big',
      invalidId: true,
      itemId: 'dl5002-16|17',
      otherId: 'big',
      patternId: 'dl5002',
      patternMinLength: 4,
      patternMinNumber: 1000,
      patternNumber: 5002,
      patternPrefix: 'dl',
      patternSeparator: false,
      prefixNumber: 3,
      tag: 'performance',
    })
  })
  test('valid patterns', () => {
    const parts = getIdParts('pf-00001-17')
    expect(parts.patternId).toBe('pf001')
    expect(parts.colorId).toBe('17')
    expect(parts.itemId).toBe('pf001-17')

    expect(getIdParts('dl5002-17')).toEqual({
      appCode: 'dl',
      categoryId: 'textile',
      colorId: '17',
      colorNumber: 17,
      // colorParts: ['17'],
      itemId: 'dl5002-17',
      patternId: 'dl5002',
      patternMinLength: 4,
      patternMinNumber: 1000,
      patternNumber: 5002,
      patternPrefix: 'dl',
      patternSeparator: false,
      prefixNumber: 3,
      tag: 'performance',
    })
    expect(getIdParts('dl5002-16|17')).toEqual({
      appCode: 'dl',
      categoryId: 'textile',
      colorId: '16|17',
      colorNumber: 2065,
      // colorParts: ['16', '17'],
      itemId: 'dl5002-16|17',
      patternId: 'dl5002',
      patternMinLength: 4,
      patternMinNumber: 1000,
      patternNumber: 5002,
      patternPrefix: 'dl',
      patternSeparator: false,
      prefixNumber: 3,
      tag: 'performance',
    })
    expect(getIdParts('PF7006-03')).toEqual({
      appCode: 'rg',
      categoryId: 'textile',
      colorId: '03',
      colorNumber: 3,
      input: 'PF7006-03',
      itemId: 'pf7006-03',
      patternId: 'pf7006',
      patternMinLength: 3,
      patternMinNumber: 1,
      patternNumber: 7006,
      patternPrefix: 'pf',
      patternSeparator: false,
      prefixNumber: 7,
      tag: 'performance',
    })
    expect(getIdParts('dl5002-16|17')).toEqual({
      appCode: 'dl',
      categoryId: 'textile',
      colorId: '16|17',
      colorNumber: 2065,
      itemId: 'dl5002-16|17',
      patternId: 'dl5002',
      patternMinLength: 4,
      patternMinNumber: 1000,
      patternNumber: 5002,
      patternPrefix: 'dl',
      patternSeparator: false,
      prefixNumber: 3,
      tag: 'performance',
    })
  })
})

// Test that array is returned.
describe('getItemParts', () => {
  test('valid patterns', () => {
    expect(getItemParts('1120-10')).toEqual([null, '1120', '10'])
    expect(getItemParts('1120')).toEqual([null, '1120'])
    expect(getItemParts('dl10002')).toEqual(['dl', '10002'])
    expect(getItemParts('l-1007')).toEqual(['l', '1007'])
    expect(getItemParts('l-1007-10')).toEqual(['l', '1007', '10'])
    expect(getItemParts('p-01')).toEqual(['p', '01'])
    expect(getItemParts('p01-1')).toEqual(['p', '01', '1'])
  })
  test('invalid patterns', () => {
    expect(getItemParts('6napkin')).toEqual([null, '6napkin'])
    expect(getItemParts('ovbread1')).toEqual(['ovbread', '1'])
  })
})
describe('getPartsInfo', () => {
  test('valid patterns', () => {
    expect(getPartsInfo('dl10002')).toEqual({
      input: 'dl10002',
      patternNumber: 10002,
      patternPrefix: 'dl',
      patternSeparator: false,
    })
    expect(getPartsInfo('p-1120').patternSeparator).toBe(true)
    expect(getPartsInfo('p-01')).toEqual({
      input: 'p-01',
      patternNumber: 1,
      patternPrefix: 'p',
      patternSeparator: true,
      // remainingParts: ['01'],
    })
  })
  test('invalid', () => {
    expect(getPartsInfo('p-000')).toEqual({
      input: 'p-000',
      patternNumber: null,
      patternPrefix: 'p',
      patternSeparator: true,
      remainingParts: ['000'],
    })
  })
})

describe('getPatternIdInfo', () => {
  test('invalid patterns', () => {
    expect(getPatternIdInfo('l').categoryId).toBe('leather')
    expect(getPatternIdInfo('p').patternMinNumber).toBe(10)
    expect(getPatternIdInfo('r-')).toEqual({
      appCode: null,
      categoryId: 'invalid',
      patternId: null,
      patternPrefix: 'r',
      patternNumber: null,
      patternSeparator: false,
      prefixInvalid: true,
      input: 'r-',
      prefixNumber: 15,
      errors: [
        { part: 'prefix', message: 'Invalid pattern prefix or pattern id.' },
        { part: 'pattern', message: 'Missing a pattern number.' },
      ],
    })
    expect(getPatternIdInfo('p-00')).toEqual({
      appCode: 'rg',
      categoryId: 'trim',
      input: 'p-00',
      patternNumber: null,
      patternId: null,
      patternMinLength: 4,
      patternMinNumber: 10,
      patternPrefix: 'p',
      patternSeparator: true,
      prefixNumber: 1,
      remainingParts: ['00'],
      errors: [
        { part: 'pattern', message: 'Missing a pattern number.' },
      ],
    })
    expect(getPatternIdInfo('009')).toEqual({
      appCode: null,
      categoryId: 'invalid',
      input: '009',
      patternNumber: 9,
      patternId: '9',
      patternPrefix: null,
      patternSeparator: false,
      prefixInvalid: true,
      prefixNumber: 15, // PREFIX_INVALID
      errors: [
        { part: 'prefix', message: 'Invalid pattern prefix or pattern id.' },
      ],
    })
  })
})

describe('prefixToNumber', () => {
  test('basic patterns', () => {
    expect(prefixToNumber({ patternPrefix: 'p', patternSeparator: true })).toBe(1)
    expect(prefixToNumber({ patternPrefix: 'p', patternSeparator: false })).toBe(0x11)
    expect(prefixToNumber({ patternPrefix: 'dl', patternSeparator: true })).toBe(3)
    expect(prefixToNumber({ patternPrefix: 'dl', patternSeparator: false })).toEqual(19)
    expect(prefixToNumber({
      colorIsRaw: true,
      patternPrefix: 'dl',
      patternSeparator: false,
    })).toEqual(51)
    expect(prefixToNumber({
      colorIsRaw: true,
      patternPrefix: null,
      patternSeparator: true,
    })).toEqual(0x20)
  })
  test('invalidPrefix', () => {
    expect(prefixToNumber({ patternPrefix: 'r', patternSeparator: false })).toEqual(31)
    expect(prefixToNumber({ patternPrefix: '!', patternSeparator: false })).toEqual(31)
    expect(prefixToNumber({ patternPrefix: 'r', patternSeparator: true })).toEqual(15)
  })
})
describe('numberToPrefix', () => {
  test('basic patterns', () => {
    expect(numberToPrefix(3)).toEqual({ colorIsRaw: false, patternPrefix: 'dl', patternSeparator: true })
    expect(numberToPrefix(19)).toEqual({ colorIsRaw: false, patternPrefix: 'dl', patternSeparator: false })
    expect(numberToPrefix(51)).toEqual({ colorIsRaw: true, patternPrefix: 'dl', patternSeparator: false })
  })
})

describe('toArchiveId', () => {
  test('basic patterns', () => {
    expect(toArchiveId('p-710014-48')).toBe('A1-NNBY-1G')
    expect(toArchiveId('dl5002-16')).toBe('AK-4WA-G')
    expect(toArchiveId('dl5002-17')).toBe('AK-4WA-H')
    expect(toArchiveId('dl5002-16|17')).toBe('AK-4WA-20H')
    expect(toArchiveId('dl-5002-16|17')).toBe('AK-4WA-20H')
    expect(toArchiveId('l-1001-12')).toBe('A2-Z9-C')
    expect(toArchiveId('710014-01')).toBe('A0-NNBY-1')
    expect(toArchiveId('938034-11')).toBe('A0-WM1J-B')
    expect(toArchiveId('dli2010-01')).toBe('AM-1YT-1')
    expect(toArchiveId('710014-29')).toBe('A0-NNBY-X')
    expect(toArchiveId('pft710014-21')).toBe('AR-NNBY-N')
    expect(toArchiveId('710014-12', true)).toBe('A10-NNBY-12')
    expect(toArchiveId('dl5002-16|17', true)).toBe('A1K-4WA-16|17')
    expect(toArchiveId('p-710014-13', true)).toBe('A11-NNBY-13')
    expect(toArchiveId('pft710014-21', true)).toBe('A1R-NNBY-21')
    expect(toArchiveId('dl5002-31')).toBe('AK-4WA-Z')
  })
  test('invalid', () => {
    expect(toArchiveId('dli0010-01')).toBe(null)
  })
  invalidIds.forEach((id) => {
    test(id, () => {
      expect(toArchiveId(id)).toBe(null)
    })
  })
})

describe('fromArchiveId', () => {
  test('basic patterns', () => {
    expect(fromArchiveId('A1-NnBy-l').itemId).toBe('p-710014-01')
    expect(fromArchiveId('Ak-4wA-20H').itemId).toBe('dl5002-16|17')
    expect(fromArchiveId('A3-4wA-20H').itemId).toBe('dl5002-16|17')
    expect(fromArchiveId('a2-z9-C').itemId).toBe('l-1001-12')
    expect(fromArchiveId('A0-NNBY-1').itemId).toBe('710014-01')
    expect(fromArchiveId('AM iyt-l').itemId).toBe('dli2010-01')
    expect(fromArchiveId('A1R-NNBY-21').itemId).toBe('pft710014-21')
    expect(fromArchiveId('A10-NNBY-12')).toMatchObject({
      itemId: '710014-12',
      archiveId: 'A0-NNBY-C',
    })
  })
  test('with extra', () => {
    expect(fromArchiveId('AK-4WA-Z|F0')).toMatchObject({
      itemId: 'dl5002-31',
      otherId: 'F0',
    })
  })
  test('validIds', () => {
    validIds.forEach((id) => {
      const itemId = `${id}-04`
      const archiveId = toArchiveId(itemId)
      expect(fromArchiveId(archiveId)).toMatchObject({
        input: archiveId,
        itemId,
      })
    })
  })
})

describe('getItemIdInfo', () => {
  test('basic patterns', () => {
    expect(getItemIdInfo('A0-Wmij-B')).toEqual({
      input: 'A0-Wmij-B',
      appCode: 'rg',
      archiveId: 'A0-WM1J-B',
      categoryId: 'textile',
      patternId: '938034',
      colorId: '11',
      colorNumber: 11,
      patternNumber: 938034,
      patternPrefix: null,
      itemId: '938034-11',
      patternMinLength: 4,
      patternMinNumber: 9000,
      patternSeparator: false,
      prefixNumber: 0,
    })
  })
  test('rg prefix', () => {
    expect(getItemIdInfo('rg-001-10')).toEqual({
      input: 'rg-001-10',
      appCode: 'rg',
      archiveId: 'AT-1-A',
      categoryId: 'textile',
      patternId: 'rg001',
      colorId: '10',
      colorNumber: 10,
      patternNumber: 1,
      patternPrefix: 'rg',
      itemId: 'rg001-10',
      patternMinLength: 3,
      patternMinNumber: 1,
      patternSeparator: false,
      prefixNumber: 10,
    })
    expect(getItemIdInfo('rg')).toMatchObject({
      appCode: 'rg',
      archiveId: null,
      invalidId: true,
      patternNumber: null,
      prefixNumber: 10,
    })
  })
  test('empty', () => {
    expect(getItemIdInfo()).toMatchObject({
      appCode: null,
      archiveId: null,
      invalidId: true,
      patternNumber: null,
      prefixNumber: 15,
    })
    expect(getItemIdInfo('')).toMatchObject({
      appCode: null,
      archiveId: null,
      invalidId: true,
      patternNumber: null,
      prefixNumber: 15,
    })
    expect(getItemIdInfo('r')).toMatchObject({
      appCode: null,
      archiveId: null,
      invalidId: true,
      patternNumber: null,
      prefixNumber: 15,
    })
    expect(getItemIdInfo('---')).toMatchObject({
      appCode: null,
      archiveId: null,
      invalidId: true,
      patternNumber: null,
      prefixNumber: 15,
    })
  })
})
// describe('hasValidPatternFormat', () => {
//   test('valid patterns', () => {
//     expect(hasValidPatternFormat('dl710014')).toBe(true)
//     expect(hasValidPatternFormat('0001')).toBe(true)
//     expect(hasValidPatternFormat('p-100')).toBe(true)
//   })
//   test('invalid patterns', () => {
//     expect(hasValidPatternFormat(null)).toBe(false)
//     expect(hasValidPatternFormat(undefined)).toBe(false)
//     expect(hasValidPatternFormat('kai')).toBe(false)
//     expect(hasValidPatternFormat('p-01')).toBe(false)
//   })
// })
describe('splitItemId', () => {
  test('split with no dash', () => {
    expect(splitItemId('dl710014')).toEqual(['dl', '710014'])
    expect(splitItemId('pf2001')).toEqual(['pf', '2001'])
    expect(splitItemId('dlt105')).toEqual(['dlt', '105'])
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
  validIds.forEach((id) => {
    test(id, () => {
      expect(isValidPattern(id)).toBe(true)
    })
  })
  invalidIds.forEach((id) => {
    test(id, () => {
      expect(isValidPattern(id)).toBe(false)
    })
  })
})

// describe('prepColorParts', () => {
//   test('leave correct colorId along', () => {
//     expect(prepColorParts('01')).toBe('01')
//     expect(prepColorParts('10')).toBe('10')
//   })
//   test('strip extra 0 at start', () => {
//     expect(prepColorParts('001')).toBe('01')
//     expect(prepColorParts('010')).toBe('10')
//   })
//   test('pad 0 at start of num', () => {
//     expect(prepColorParts('1')).toBe('01')
//   })
//   test('no pad or strip when not num', () => {
//     expect(prepColorParts('0b0')).toBe('0b0')
//     expect(prepColorParts('b0')).toBe('b0')
//     expect(prepColorParts('0b')).toBe('0b')
//   })
// })
describe('patternIsTextile', () => {
  test('2 numbers invalid', () => {
    expect(patternIsTextile('10')).toBe(false)
  })
  test('3 numbers invalid', () => {
    expect(patternIsTextile('010')).toBe(false)
    expect(patternIsTextile('999')).toBe(false)
  })
  test('removes dl prefix', () => {
    expect(patternIsTextile('dl1001')).toBe(true)
  })
  test('4 numbers or more', () => {
    expect(patternIsTextile('dl1011')).toBe(true)
    expect(patternIsTextile('00100')).toBe(false)
    expect(patternIsTextile('08100')).toBe(false)
    expect(patternIsTextile('01094402')).toBe(true)
  })
})
// describe('validIdChars', () => {
//   test('valid itemId', () => {
//     expect([...validIdChars.exec('p-710014-01')]).toEqual(['p-710014-01'])
//     expect([...validIdChars.exec('710014-01')]).toEqual(['710014-01'])
//     expect(validIdChars.exec('dl710014-01')[0]).toEqual('dl710014-01')
//     expect(validIdChars.exec('dl-710014-01')[0]).toEqual('dl-710014-01')
//     expect(validIdChars.exec('dli710014-01')[0]).toEqual('dli710014-01')
//     expect(validIdChars.exec('dli-710014-01')[0]).toEqual('dli-710014-01')
//     expect(validIdChars.exec('dlt105-01')[0]).toEqual('dlt105-01')
//     expect(validIdChars.exec('014-01')[0]).toBe('014-01')
//   })
//   test('invalid itemId', () => {
//     expect(validIdChars.exec('s710014-01')).toBe(null)
//     expect(validIdChars.exec('14-01')).toBe(null)
//   })
// })
// describe('hasValidIdFormat', () => {
//   test('valid itemId', () => {
//     expect(hasValidIdFormat('710014-01')).toBe(true)
//     expect(hasValidIdFormat('p-0010-01')).toBe(true)
//     expect(hasValidIdFormat('dl0010-01')).toBe(true)
//     expect(hasValidIdFormat('dli0010-01')).toBe(true)
//     expect(hasValidIdFormat('dlt0010-01')).toBe(true)
//     expect(hasValidIdFormat('p-010-01')).toBe(true)
//     expect(hasValidIdFormat('014-01')).toBe(true)
//   })
//   test('invalid itemId', () => {
//     expect(hasValidIdFormat('dil0010-01')).toBe(false)
//     expect(hasValidIdFormat('d0010-01')).toBe(false)
//     expect(hasValidIdFormat('p010-01')).toBe(false)
//     expect(hasValidIdFormat('14-01')).toBe(false)
//     expect(hasValidIdFormat('p-0010-01_01')).toBe(false)
//     expect(hasValidIdFormat('s710014-01')).toBe(false)
//     expect(hasValidIdFormat('p-10-01')).toBe(false)
//     expect(hasValidIdFormat('p-001a-01')).toBe(false)
//     expect(hasValidIdFormat('dl0010-010')).toBe(false)
//   })
// })

describe('isPatternPart', () => {
  test('basic pattern parts', () => {
    expect(isPatternPart('710014')).toBe(true)
    expect(isPatternPart('pf014')).toBe(true)
    expect(isPatternPart('pf0014')).toBe(true)
    expect(isPatternPart('p0100')).toBe(true)
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
      appCode: 'rg',
      archiveId: 'A0-NNBY-1',
      categoryId: 'textile',
      patternId: '710014',
      colorId: '01',
      colorNumber: 1,
      patternPrefix: null,
      itemId: '710014-01',
      patternMinLength: 4,
      patternMinNumber: 9000,
      patternNumber: 710014,
      patternSeparator: false,
      prefixNumber: 0,
    })
  })
  test('trim id', () => {
    expect(getItemIdParts('P-1120-14')).toEqual({
      input: 'P-1120-14',
      appCode: 'rg',
      archiveId: 'A1-130-E',
      categoryId: 'trim',
      colorId: '14',
      colorNumber: 14,
      patternId: 'p-1120',
      patternMinLength: 4,
      patternMinNumber: 10,
      patternPrefix: 'p',
      itemId: 'p-1120-14',
      patternNumber: 1120,
      patternSeparator: true,
      prefixNumber: 1,
    })
  })
  test('dl item', () => {
    expect(getItemIdParts('DL5002-16-17')).toEqual({
      input: 'DL5002-16-17',
      appCode: 'dl',
      archiveId: 'AK-4WA-20H',
      categoryId: 'textile',
      colorId: '16|17',
      colorNumber: 2065,
      patternId: 'dl5002',
      patternPrefix: 'dl',
      itemId: 'dl5002-16|17',
      patternMinLength: 4,
      patternMinNumber: 1000,
      patternNumber: 5002,
      patternSeparator: false,
      prefixNumber: 3,
      tag: 'performance',
    })

    expect(getItemIdParts('Dl1015-06|07')).toEqual({
      appCode: 'dl',
      input: 'Dl1015-06|07',
      patternId: 'dl1015',
      colorId: '06|07',
      colorNumber: 775,
      patternPrefix: 'dl',
      itemId: 'dl1015-06|07',
      patternNumber: 1015,
      patternSeparator: false,
      patternMinLength: 4,
      patternMinNumber: 1000,
      categoryId: 'textile',
      archiveId: 'AK-ZQ-R7',
      prefixNumber: 3,
      tag: 'performance',
    })
    expect(getItemIdParts('dl5002-16-17')).toEqual({
      appCode: 'dl',
      input: 'dl5002-16-17',
      patternId: 'dl5002',
      colorId: '16|17',
      colorNumber: 2065,
      patternPrefix: 'dl',
      itemId: 'dl5002-16|17',
      patternMinLength: 4,
      patternMinNumber: 1000,
      patternNumber: 5002,
      patternSeparator: false,
      categoryId: 'textile',
      archiveId: 'AK-4WA-20H',
      prefixNumber: 3,
      tag: 'performance',
    })
    expect(getItemIdParts('dli2001-16')).toEqual({
      appCode: 'dl',
      patternId: 'dli2001',
      colorId: '16',
      colorNumber: 16,
      patternPrefix: 'dli',
      itemId: 'dli2001-16',
      patternMinNumber: 2000,
      patternMinLength: 4,
      patternNumber: 2001,
      patternSeparator: false,
      categoryId: 'linen',
      archiveId: 'AM-1YH-G',
      prefixNumber: 4,
      tag: 'performance',
    })
    expect(getItemIdParts('dli-2001-16')).toEqual({
      appCode: 'dl',
      archiveId: 'AM-1YH-G',
      categoryId: 'linen',
      patternId: 'dli2001',
      colorId: '16',
      colorNumber: 16,
      patternPrefix: 'dli',
      itemId: 'dli2001-16',
      input: 'dli-2001-16',
      patternNumber: 2001,
      patternSeparator: false,
      patternMinNumber: 2000,
      patternMinLength: 4,
      prefixNumber: 4,
      tag: 'performance',
    })
    expect(getItemIdParts('dlt105-05')).toEqual({
      appCode: 'dl',
      archiveId: 'AN-39-5',
      categoryId: 'trim',
      colorId: '05',
      colorNumber: 5,
      patternId: 'dlt105',
      patternPrefix: 'dlt',
      itemId: 'dlt105-05',
      patternMinNumber: 100,
      patternMinLength: 3,
      patternNumber: 105,
      patternSeparator: false,
      prefixNumber: 5,
      tag: 'performance',
    })
  })
  test('leather', () => {
    expect(getItemIdParts('l-1001-12')).toEqual({
      appCode: 'rg',
      archiveId: 'A2-Z9-C',
      categoryId: 'leather',
      patternId: 'l-1001',
      colorId: '12',
      colorNumber: 12,
      patternPrefix: 'l',
      itemId: 'l-1001-12',
      patternMinLength: 4,
      patternMinNumber: 1000,
      patternNumber: 1001,
      patternSeparator: true,
      prefixNumber: 2,
    })
  })
  test('extra start 0', () => {
    expect(getItemIdParts('938034-011')).toEqual({
      input: '938034-011',
      appCode: 'rg',
      archiveId: 'A0-WM1J-B',
      colorId: '11',
      colorNumber: 11,
      patternId: '938034',
      // invalidId: true,
      patternPrefix: null,
      itemId: '938034-11',
      patternMinLength: 4,
      patternMinNumber: 9000,
      patternNumber: 938034,
      patternSeparator: false,
      categoryId: 'textile',
      prefixNumber: 0,
    })
  })
  test('invalid', () => {
    expect(getItemIdParts('p 40')).toEqual({
      input: 'p 40',
      appCode: 'rg',
      archiveId: null,
      categoryId: 'trim',
      colorId: null,
      colorNumber: 0,
      invalidId: true,
      patternId: 'p-0040',
      patternPrefix: 'p',
      itemId: null,
      prefixNumber: 1,
      patternMinLength: 4,
      patternMinNumber: 10,
      patternNumber: 40,
      patternSeparator: true,
      errors: [
        { part: 'colorId', message: 'Missing valid Color Id.' },
      ],
    })
    expect(getItemIdParts('toRrent_sAnd-ebOny')).toEqual({
      input: 'toRrent_sAnd-ebOny',
      appCode: null,
      archiveId: null,
      invalidId: true,
      colorId: null,
      colorNumber: 0,
      patternId: null,
      otherId: 'sand_ebony',
      patternPrefix: 'torrent',
      prefixInvalid: true,
      itemId: null,
      prefixNumber: 15,
      patternNumber: null,
      patternSeparator: true,
      categoryId: 'invalid',
      errors: [
        { part: 'prefix', message: 'Invalid pattern prefix or pattern id.' },
        { part: 'pattern', message: 'Missing a pattern number.' },
        { part: 'colorId', message: 'Missing valid Color Id.' },
        { part: 'otherId', message: 'Item id has extra information at the end. sand_ebony' },
      ],
    })
    expect(getItemIdParts('945005-03_L')).toEqual({
      input: '945005-03_L',
      appCode: 'rg',
      invalidId: true,
      colorId: '03',
      colorNumber: 3,
      patternId: '945005',
      otherId: 'l',
      patternPrefix: null,
      itemId: '945005-03',
      patternNumber: 945005,
      patternMinLength: 4,
      patternMinNumber: 9000,
      patternSeparator: false,
      categoryId: 'textile',
      archiveId: null,
      prefixNumber: 0,
      errors: [
        { part: 'otherId', message: 'Item id has extra information at the end. l' },
      ],
    })
    expect(getItemIdParts('P-0103-13-big')).toEqual({
      input: 'P-0103-13-big',
      appCode: 'rg',
      categoryId: 'trim',
      invalidId: true,
      patternId: 'p-0103',
      colorId: '13',
      colorNumber: 13,
      otherId: 'big',
      patternPrefix: 'p',
      itemId: 'p-0103-13',
      patternMinLength: 4,
      patternMinNumber: 10,
      patternNumber: 103,
      patternSeparator: true,
      archiveId: null,
      prefixNumber: 1,
      errors: [
        { part: 'otherId', message: 'Item id has extra information at the end. big' },
      ],
    })
    expect(getItemIdParts('d-p-0103-13-big')).toEqual({
      appCode: null,
      input: 'd-p-0103-13-big',
      invalidId: true,
      patternId: null,
      colorId: '13',
      colorNumber: 13,
      otherId: 'p_0103_big',
      patternPrefix: 'd',
      itemId: null,
      patternNumber: null,
      patternSeparator: true,
      categoryId: 'invalid',
      archiveId: null,
      prefixInvalid: true,
      prefixNumber: 15,
      errors: [
        { part: 'prefix', message: 'Invalid pattern prefix or pattern id.' },
        { part: 'pattern', message: 'Missing a pattern number.' },
        { part: 'otherId', message: 'Item id has extra information at the end. p_0103_big' },
      ],
    })
    expect(getItemIdParts('p-01d03-13')).toEqual({
      appCode: 'rg',
      input: 'p-01d03-13',
      invalidId: true,
      patternId: null,
      colorId: '13',
      colorNumber: 13,
      otherId: '01d03',
      patternPrefix: 'p',
      itemId: null,
      patternNumber: null,
      patternSeparator: true,
      categoryId: 'trim',
      archiveId: null,
      patternMinLength: 4,
      patternMinNumber: 10,
      prefixNumber: 1,
      errors: [
        { part: 'pattern', message: 'Missing a pattern number.' },
        { part: 'otherId', message: 'Item id has extra information at the end. 01d03' },
      ],
    })
    expect(getItemIdParts('apron')).toMatchObject({
      appCode: null,
      categoryId: 'invalid',
      patternPrefix: 'apron',
      invalidId: true,
    })
    expect(getItemIdParts('ap9ron')).toMatchObject({
      appCode: null,
      categoryId: 'invalid',
      patternPrefix: 'ap',
      invalidId: true,
      otherId: '9ron',
    })
  })
})
// THESE NO LONGER WORK CORRECTLY SINCE COLORS ARE OVER 64
describe('itemIdToNumber', () => {
  test('valid patterns', () => {
    expect(itemIdToNumber('910098-02')).toBe(116483546)
    // expect(itemIdToNumber('945005-03')).toBe(120951643)
    // expect(itemIdToNumber('l-9300010-30')).toBe(2742675318)
    // expect(itemIdToNumber('p-1114-14')).toBe(1073804134)
  })
})
describe('fromItemNumber', () => {
  test('valid patterns', () => {
    expect(fromItemNumber(116483546)).toMatchObject({
      itemId: '910098-02',
    })
    // expect(fromItemNumber(120951643)).toMatchObject({
    //   categoryId: 'textile',
    //   patternId: '945005',
    //   colorId: '03',
    //   itemId: '945005-03',
    // })
    // expect(fromItemNumber(2742675318)).toMatchObject({
    //   itemId: 'l-9300010-30',
    //   patternSeparator: true,
    // })
    // expect(fromItemNumber(1073804134)).toMatchObject({
    //   itemId: 'p-1114-14',
    //   patternSeparator: true,
    // })
  })
})
