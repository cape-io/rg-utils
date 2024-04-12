import _ from 'lodash/fp.js'
import { mergeFields, setField } from 'prairie'
import { toBase32, fromBase32 } from 'crockford-base32-number'
import {
  TEXTILE, LEATHER, LINEN, TRIM, PREFIX_INVALID,
  getInfoFromPrefix, getNumberFromPrefix, getPrefixFromNumber, getPrefixInfoFromNumber,
} from './cat-ids.js'

const SEPARATOR = '-'
const COLOR_SEPARATOR = '|'
// 4 16, 5  32, 6  64, 7 127
// 8 256, 9 512, 10 1024, 11 2048, 12 4096, 13 8192, 14 16384
const COLOR_BITS = 7 // Exceeded 63 in Nov of 2022.
// const COLORS_BITS = 6 // Double colors.
const COLOR_MAX = 2 ** COLOR_BITS
const CLR_MAX = 99
const CLRS_MAX = 2 ** (COLOR_BITS * 2)
// 24 = 16777215
const PATTERN_BITS = 24
const PATTERN_MIN = 1
const PATTERN_MAX = 2 ** PATTERN_BITS
const PATTERN_RAW_BITS = 14
const PATTERN_RAW_MAX = 2 ** PATTERN_RAW_BITS

// BASIC UTIL FUNCS
const padNumber = _.padCharsStart('0')
const padColor = padNumber(2)
const splitOnSeparator = _.flow(_.split(SEPARATOR), _.compact)
const splitColorId = _.split(COLOR_SEPARATOR)
const getIndexOfFirstNumber = _.findIndex((x) => x.match(/\d/))
export function splitAtFirstNumber(str) {
  const index = getIndexOfFirstNumber(str)
  if (index === 0) return [null, str]
  if (index > 0) return [str.slice(0, index), str.slice(index)]
  return [str]
}

function fromB32(code) {
  // Do we need to worry about 5 and S looking alike?
  return fromBase32(code.toUpperCase().replaceAll('I', 1).replaceAll('L', 1).replaceAll('O', 0))
}

// BASIC CHECKS
// Use patternMinNumber based on prefix for more accurate result!
export const ispatternInt = (x) => _.isFinite(x) && x >= PATTERN_MIN && x < PATTERN_MAX
// Single color value.
export const isColorNum = _.flow(Number, (x) => x > 0 && x < CLR_MAX)
export const isMixedColorNum = (colorNum) => colorNum >= CLR_MAX && colorNum < CLRS_MAX
export const isColorIdNum = _.overSome([isColorNum, isMixedColorNum])

// export const validIdChars = /^(?:dl(?:i|t)?-?|p-|l-|pf)?[0-9]{3,}-[0-9]{2}(?:[|-][0-9]{2})?$/
// export const isValidPatternChars = /^(?:dl(?:i|t)?-?|p-|l-|pf)?[0-9]{3,}$/

// BASIC ITEM ID

// Prepare raw string. need to remove _.words functionality
export const idStrPrep = _.flow(
  _.toLower,
  _.replace(/[/_| .]/g, SEPARATOR),
  _.split(SEPARATOR),
  _.map(_.flow(_.kebabCase, _.replace(/-/g, ''))),
  _.compact,
  _.join(SEPARATOR),
)

function splitId(id) {
  const parts = splitOnSeparator(id)
  return splitAtFirstNumber(parts[0]).concat(_.tail(parts))
}
export const getItemParts = _.cond([
  [_.includes(SEPARATOR), splitId],
  [_.stubTrue, splitAtFirstNumber],
])
export const splitItemId = _.flow(idStrPrep, getItemParts)

// PATTERN

function getPatternInt(pattern) {
  const patternInt = Number(pattern)
  return ispatternInt(patternInt) ? patternInt : null
}

function hasPatternSeparator(patternPrefix, itemParts, itemId) {
  if (!patternPrefix || itemParts.length === 1) return false
  return itemParts.length === splitOnSeparator(itemId).length
}

// Take pattern string and turn it into parts.
// Used to shorten bits pattern number requires.
export function getPatternParts(pattern) {
  const patternInt = getPatternInt(pattern)
  if (patternInt) return { pattern, patternInt }
  const { length } = pattern
  const style = Number(pattern.slice(-3))
  const source = Number(pattern.slice(0, -2, 3))
  return {
    pattern, length, source, style,
  }
}

// Everything but the colorId(s)
export function getPartsInfo(input) {
  const itemId = idStrPrep(input)
  const itemParts = getItemParts(itemId)
  const [patternPrefix, ...otherParts] = itemParts
  const patternInt = getPatternInt(_.first(otherParts))
  const remainingParts = patternInt ? _.tail(otherParts) : otherParts
  return {
    input,
    patternInt,
    patternPrefix,
    patternSeparator: hasPatternSeparator(patternPrefix, itemParts, itemId),
    remainingParts: remainingParts.length ? remainingParts : undefined,
  }
}

function getPatternId(itemParts) {
  const {
    patternPrefix, patternSeparator, patternInt, patternMinLength,
  } = itemParts
  const prefix = patternPrefix || ''
  const separator = patternSeparator ? SEPARATOR : ''
  if (!patternInt) return null
  const pattern = padNumber(patternMinLength, patternInt.toString())
  return [prefix, separator, pattern].join('')
}
function getPatternErrors({ patternInt, prefixInvalid, patternMinNumber }) {
  const errors = []
  if (prefixInvalid) {
    errors.push({ part: 'prefix', message: 'Invalid pattern prefix or pattern id.' })
  }
  if (!patternInt) {
    errors.push({ part: 'pattern', message: 'Missing a pattern number.' })
  } else if (patternMinNumber > patternInt) {
    errors.push({ part: 'pattern', message: 'Pattern number too small.' })
  }
  return errors.length ? errors : undefined
}
const addPatternId = _.flow(setField('patternId', getPatternId), setField('errors', getPatternErrors))
const addPatternInfo = _.flow(mergeFields(getInfoFromPrefix), addPatternId)

// Take string and return object with pattern information and remaining parts.
export const getPatternIdInfo = _.flow(getPartsInfo, addPatternInfo)

export const isValidPattern = _.flow(getPatternIdInfo, _.get('errors'), _.isEmpty)
export const patternIsTextile = _.flow(getPatternIdInfo, _.matches({ categoryId: TEXTILE }))

export const patternIsLinen = _.flow(getPatternIdInfo, _.matches({ categoryId: LINEN }))
export const patternIsTrim = _.flow(getPatternIdInfo, _.matches({ categoryId: TRIM }))
export const patternIsLeather = _.flow(getPatternIdInfo, _.matches({ categoryId: LEATHER }))

export const isPatternPart = _.flow(
  getPatternIdInfo,
  ({
    prefixInvalid, patternPrefix, patternInt,
  }) => (!prefixInvalid && !!patternPrefix) || (!prefixInvalid && !!patternInt),
)

// ITEM ID
// Join patternId with colorId to form itemId string.
export const getItemId = _.curry((patternId, colorId) => (patternId && colorId ? `${patternId}-${colorId}` : null))

export function isItemInfoValid(info) {
  const errors = info.errors || []
  if (!info.colorId) {
    errors.push({ part: 'colorId', message: 'Missing valid Color Id.' })
  }
  if (info.otherId) {
    errors.push({ part: 'otherId', message: `Item id has extra information at the end. ${info.otherId}` })
  }
  return errors.length ? errors : undefined
}

// COLORS

export function numberToColor(colorNum) {
  if (isColorNum(colorNum)) return padColor(colorNum)
  return null
}
const toColorPart = _.flow(Number, numberToColor)
export const colorsToString = _.flow(_.map(toColorPart), _.join(COLOR_SEPARATOR))

function partsToId(info) {
  const { colorId } = info
  return getItemId(getPatternId(info), colorId)
}

/* eslint-disable no-bitwise */
export function colorPartsToNumber(x) {
  if (x.length === 1) return Number(x[0])
  return (Number(x[0]) << COLOR_BITS) | Number(x[1])
}

export const numberToColorParts = _.cond([
  [isColorNum, (x) => ([x])],
  [isMixedColorNum, (x) => ([x >>> COLOR_BITS, x & (COLOR_MAX - 1)])],
])

// ADD COLOR ID (without archiveId)
export function itemIdObj({ remainingParts, ...info }) {
  // Allows colors to be out of order with other errors.
  const colorParts = _.filter(isColorNum, remainingParts).slice(0, 2)
  const otherParts = _.pullAll(colorParts, remainingParts)
  const result = {
    ...info,
    // colorParts,
    colorId: colorParts.length ? colorsToString(colorParts) : null,
    colorNumber: colorPartsToNumber(colorParts),
    otherId: otherParts.length ? otherParts.join('_') : undefined,
  }
  result.errors = isItemInfoValid(result)
  if (result.errors) result.invalidId = true
  result.itemId = partsToId(result)
  if (result.input === result.itemId) delete result.input
  return result
}

// ARCHIVE NUMBERS

// Bitwise is okay because it's cool to work in binary?

export function prefixToNumber({ colorIsRaw, patternPrefix, patternSeparator }) {
  const prefixNumber = getNumberFromPrefix(patternPrefix) & 0xF
  const separator = (patternPrefix === null || patternSeparator) ? 0x0 : 0x10
  const rawColor = colorIsRaw ? 0x20 : 0x0
  // Combine separator flag to prefix number into one number.
  return separator | prefixNumber | rawColor
}
// 5 bits (32 max) for one number. 10 bits for two
export function colorsToNumber({ colorId }) {
  if (!colorId) return null
  return colorPartsToNumber(splitColorId(colorId))
}
export function numberToColors(colorNum) {
  return isColorIdNum(colorNum) ? numberToColorParts(colorNum) : null
}

export const getArchivePrefix = (info) => `A${toBase32(prefixToNumber(info))}`
export const getArchivePattern = ({ patternInt }) => toBase32(patternInt)
export const getArchiveColor = _.flow(colorsToNumber, toBase32)

export function itemInfoToArchiveId(info) {
  const { invalidId } = info
  if (invalidId) return null
  const parts = [
    getArchivePrefix(info),
    getArchivePattern(info),
    info.colorIsRaw ? info.colorId : getArchiveColor(info),
  ]
  return parts.join(SEPARATOR)
}

const addArchiveId = setField('archiveId', itemInfoToArchiveId)
const archivePrefixToNumber = (prefix) => fromB32(prefix.substring(1))

// 4 bits for prefix, 5 bits with patternSeparator, 6 bits with colorRaw flag
export function numberToPrefix(num) {
  if (num === 0) return { patternSeparator: false, patternPrefix: null }
  if (num > 0x3F) return { prefixError: true }
  const patternPrefixNumber = num & 0xF
  const patternPrefix = getPrefixFromNumber(patternPrefixNumber)
  const patternSeparator = patternPrefix && !(num & 0x10)
  const colorIsRaw = !!(num & 0x20)
  return { colorIsRaw, patternSeparator, patternPrefix }
}

const fromArchivePrefix = _.flow(archivePrefixToNumber, numberToPrefix)

function archiveParts(input) {
  const [prefix, pattern, ...remaining] = splitOnSeparator(idStrPrep(input).toUpperCase())
  const { colorIsRaw, ...prefixInfo } = fromArchivePrefix(prefix)
  const colorNumbers = colorIsRaw ? null : numberToColors(fromB32(remaining[0]))
  return {
    input,
    ...prefixInfo,
    patternInt: fromB32(pattern),
    remainingParts: colorNumbers ? colorNumbers.concat(_.tail(remaining)) : remaining,
  }
}

export const fromArchiveId = _.flow(
  archiveParts,
  addPatternInfo,
  itemIdObj,
  addArchiveId,
)

// PROCESSING

export const createItemId = ({ patternId, colorId }) => getItemId(patternId, colorId)
export const itemIdFromPatternColorId = ({ patternId }, colorId) => getItemId(patternId, colorId)
export const getPatternIndexItemId = (pattern, colorIndex) => getItemId(
  pattern.patternId,
  pattern.colorItems[colorIndex].colorId,
)

// GET ITEM ID PARTS
export const getIdParts = _.flow(getPatternIdInfo, itemIdObj)
export const getItemIdParts = _.flow(getIdParts, addArchiveId)

// itemId string to archiveId string.
export function toArchiveId(itemId, colorIsRaw = false) {
  const info = getIdParts(itemId)
  info.colorIsRaw = colorIsRaw
  return itemInfoToArchiveId(info)
}

export const isItemParts = (x) => (!!x.patternId && !!x.colorId && !x.invalidId)
export const isItemId = _.flow(getIdParts, isItemParts)

// const isValidArchivePrefix = _.flow(archivePrefixToNumber, isLt(0x20))

function isArchiveId(itemId) {
  const parts = splitOnSeparator(idStrPrep(itemId))
  if (!parts.length) return false
  return parts[0].startsWith('a') && parts.length >= 3
}

// Convert an archive or active string into an object of itemId information
export const getItemIdInfo = _.flow(
  _.cond([
    [isArchiveId, fromArchiveId],
    [_.stubTrue, getItemIdParts],
  ]),
)

// NUMBER
const NUM_SHIFT = COLOR_BITS + PATTERN_BITS
const MIN_PATTERN = 9000

// How many bits do we need?
export function itemPartsToNumber({ prefixNumber, patternInt, colorNumber }) {
  if (colorNumber >= CLR_MAX) return null // Can't handle double numbers.
  // 2 24 6
  const preNum = prefixNumber * (1 << NUM_SHIFT)
  return preNum + ((patternInt << COLOR_BITS) | colorNumber) - MIN_PATTERN
}
export const itemIdToNumber = _.flow(getIdParts, itemPartsToNumber)
export function numberToItemParts(input) {
  const num = input + MIN_PATTERN
  const prefixInfo = getPrefixInfoFromNumber(num >>> NUM_SHIFT)
  return {
    input,
    ...prefixInfo,
    patternInt: (num >>> COLOR_BITS) & (PATTERN_MAX - 1),
    remainingParts: [num & (CLR_MAX - 1)],
  }
}
export const fromItemNumber = _.flow(numberToItemParts, addPatternId, itemIdObj)
