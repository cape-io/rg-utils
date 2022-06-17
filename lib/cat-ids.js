import _ from 'lodash/fp.js'
import { oneOf } from 'understory'
// These must exactly match the values in rg-admin/categories.yaml

export const TRIM = 'trim'
export const TEXTILE = 'textile'
export const LEATHER = 'leather'
export const LINEN = 'linen'
export const DRAPERY = 'drapery'
export const INVALID = 'invalid'
export const PERFORMANCE = 'performance'
export const ANY_CAT = 'any'

export const NO_PREFIX_CAT = TEXTILE

const PATTERN_LENGTH = 4
const PATTERN_MIN_NUMBER = 1000
const APP_CODE = 'rg'

export const be = {
  [DRAPERY]: _.constant(DRAPERY),
  [INVALID]: _.constant(INVALID),
  [LEATHER]: _.constant(LEATHER),
  [LINEN]: _.constant(LINEN),
  [TEXTILE]: _.constant(TEXTILE),
  [TRIM]: _.constant(TRIM),
}

// **The order here is important.**
// Only add new options to the end of the list. Max of 8 or 16 options!
const prefixInfo = [
  {
    patternPrefix: null,
    categoryId: NO_PREFIX_CAT,
    patternMinNumber: 9000,
  },
  {
    patternPrefix: 'p', categoryId: TRIM, patternMinNumber: 10, patternSeparator: true,
  },
  {
    patternPrefix: 'l', categoryId: LEATHER, patternMinNumber: 1000, patternSeparator: true,
  },
  {
    patternPrefix: 'dl', categoryId: TEXTILE, appCode: 'dl', patternMinNumber: 1000, patternSeparator: false,
  },
  // Nothing after this will work with int color ids.
  {
    patternPrefix: 'dli', categoryId: LINEN, appCode: 'dl', patternMinNumber: 2000, patternSeparator: false,
  },
  {
    patternPrefix: 'dlt', categoryId: TRIM, appCode: 'dl', patternMinLength: 3, patternMinNumber: 100, patternSeparator: false,
  },
  { // This can be replaced with something else.
    patternPrefix: 'dll', categoryId: LEATHER, appCode: 'dl', patternMinNumber: 1000, patternSeparator: false,
  },
  {
    patternPrefix: 'pf', categoryId: TEXTILE, tag: PERFORMANCE, patternMinNumber: 1000, patternSeparator: false,
  },
  {
    patternPrefix: 'pft', categoryId: TRIM, tag: PERFORMANCE, patternMinLength: 3, patternMinNumber: 100, patternSeparator: false,
  },
  {
    patternPrefix: 'pfi', categoryId: LINEN, tag: PERFORMANCE, patternMinNumber: 2000, patternSeparator: false,
  },
  // Enter new options here.

].map((info, prefixNumber) => _.defaults({
  prefixNumber,
  appCode: APP_CODE,
  patternMinLength: PATTERN_LENGTH,
  patternMinNumber: PATTERN_MIN_NUMBER,
})(info))
// INVALID IS ALWAYS LAST
prefixInfo[15] = {
  appCode: null, categoryId: INVALID, prefixInvalid: true, prefixNumber: 15,
}
const prefixInfos = _.compact(prefixInfo)
// prefixNumber
export const categoryPrefixIds = prefixInfos.map(_.get('patternPrefix'))
export const isPatternPrefix = oneOf(categoryPrefixIds)

// key is prefix string.
export const patternPrefixInfo = new Map(prefixInfos.map((info) => ([
  info.patternPrefix, info,
])))
export function getNumberFromPrefix(patternPrefix) {
  return patternPrefixInfo.get(patternPrefix).prefixNumber
}

// pattern is only required when patternPrefix is exactly null.
export function getInfoFromPrefix({ patternPrefix, patternNumber }) {
  if (patternPrefix === null) {
    const textileInfo = patternPrefixInfo.get(patternPrefix)
    if (!_.isFinite(patternNumber) || patternNumber < textileInfo.patternMinNumber) {
      return patternPrefixInfo.get() // invalid
    }
    return textileInfo
  }
  return patternPrefixInfo.get(patternPrefix) || patternPrefixInfo.get()
}

export const getPrefixInfoFromNumber = (num) => (prefixInfo[num] || prefixInfo[15])
export function getPrefixFromNumber(patternPrefixNumber) {
  return getPrefixInfoFromNumber(patternPrefixNumber).patternPrefix
}
