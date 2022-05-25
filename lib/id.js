import _ from 'lodash/fp.js'
import { onTrue } from 'understory'
import { mergeFields, setField } from 'prairie'
import { toBase32, fromBase32 } from 'crockford-base32-number'
import {
  TEXTILE, LEATHER, LINEN, TRIM,
  getInfoFromPrefix, getPrefixFromNumber, getNumberFromPrefix,
} from './cat-ids.js'

const SEPARATOR = '-'
const COLOR_SEPARATOR = '|'

export const isPatternNumber = (patternNumber) => _.isFinite(patternNumber) && patternNumber > 9
function getPatternNumber(pattern) {
  const patternNumber = Number(pattern)
  return isPatternNumber(patternNumber) ? patternNumber : null
}
// const isPatternLength = _.flow(_.size, isGt(2))
// Need to know information from prefix.
// export const isValidPatternNumber = _.overEvery([isPatternLength, isPatternNumber])
// export const patternIsNumber = isValidPatternNumber

// FULL Id with colorId
// export const validIdChars = /^(?:dl(?:i|t)?-?|p-|l-|pf)?[0-9]{3,}-[0-9]{2}(?:[|-][0-9]{2})?$/
// export const hasValidIdFormat = (id) => !_.isEmpty(validIdChars.exec(id)) // hasValidIdChars

const splitOnSeparator = _.flow(_.split(SEPARATOR), _.compact)

// Prepare raw string. need to remove _.words functionality
export const idStrPrep = _.flow(
  _.toLower,
  _.replace(/[/_| .]/g, SEPARATOR),
  _.split(SEPARATOR),
  _.map(_.flow(_.kebabCase, _.replace(/-/g, ''))),
  _.compact,
  _.join(SEPARATOR),
)
// Just the pattern.
// export const isValidPatternChars = /^(?:dl(?:i|t)?-?|p-|l-|pf)?[0-9]{3,}$/
// export const hasValidPatternFormat = (patternId) => !_.isEmpty(isValidPatternChars.exec(patternId))

const getIndexOfFirstNumber = _.findIndex((x) => x.match(/\d/))
export function splitAtFirstNumber(str) {
  const index = getIndexOfFirstNumber(str)
  if (index === 0) return [null, str]
  if (index > 0) return [str.slice(0, index), str.slice(index)]
  return [str]
}
function splitId(id) {
  const parts = splitOnSeparator(id)
  return splitAtFirstNumber(parts[0]).concat(_.tail(parts))
}
export const getItemParts = _.cond([
  [_.includes(SEPARATOR), splitId],
  [_.stubTrue, splitAtFirstNumber],
])
export const splitItemId = _.flow(idStrPrep, getItemParts)

const isColorNum = _.flow(Number, (x) => x > 0 && x < 0x64) // 99 is max
const isMixedColorNum = (colorNum) => colorNum > 0x63 && colorNum < 0x6364
// const isColorsNum = _.overSome([isColorNum, isMixedColorNum])

const padNumber = _.padCharsStart('0')
const padColor = padNumber(2)

// const prepColorParts = onTrue(isColorNum, _.flow(_.trimCharsStart('0'), padColor))
// const isColorPart = (part) => part.length === 2 && isColorNum(part)

function hasPatternSeparator(patternPrefix, itemParts, itemId) {
  if (!patternPrefix || itemParts.length === 1) return false
  return itemParts.length === splitOnSeparator(itemId).length
}
export function getPartsInfo(input) {
  const itemId = idStrPrep(input)
  const itemParts = getItemParts(itemId)
  const [patternPrefix, ...otherParts] = itemParts
  const patternNumber = getPatternNumber(_.first(otherParts))
  const remainingParts = patternNumber ? _.tail(otherParts) : otherParts
  return {
    input,
    patternNumber,
    patternPrefix,
    patternSeparator: hasPatternSeparator(patternPrefix, itemParts, itemId),
    remainingParts: remainingParts.length ? remainingParts : undefined,
  }
}
function getPatternId(itemParts) {
  const {
    patternPrefix, patternSeparator, patternNumber, patternMinLength,
  } = itemParts
  const prefix = patternPrefix || ''
  const separator = patternSeparator ? SEPARATOR : ''
  if (!patternNumber) return null
  const pattern = padNumber(patternMinLength, patternNumber.toString())
  return [prefix, separator, pattern].join('')
}
function getPatternErrors({ patternNumber, prefixInvalid, patternMinNumber }) {
  const errors = []
  if (prefixInvalid) {
    errors.push({ part: 'prefix', message: 'Invalid pattern prefix or pattern id.' })
  }
  if (!patternNumber) {
    errors.push({ part: 'pattern', message: 'Missing a pattern number.' })
  } else if (patternMinNumber > patternNumber) {
    errors.push({ part: 'pattern', message: 'Pattern number too small.' })
  }
  return errors.length ? errors : undefined
}
const addPatternInfo = _.flow(
  mergeFields(getInfoFromPrefix),
  setField('patternId', getPatternId),
  setField('errors', getPatternErrors),
)

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
    prefixInvalid, patternPrefix, patternNumber,
  }) => (!prefixInvalid && !!patternPrefix) || !!patternNumber,
)
export const getItemId = _.curry((patternId, colorId) => (patternId && colorId ? `${patternId}-${colorId}` : null))
/* eslint-disable no-bitwise */
// Bitwise is okay because it's cool to work in binary?

export function prefixToNumber({ colorIsRaw, patternPrefix, patternSeparator }) {
  const prefixNumber = getNumberFromPrefix(patternPrefix) & 0xF
  const separator = (patternPrefix === null || patternSeparator) ? 0x0 : 0x10
  const rawColor = colorIsRaw ? 0x20 : 0x0
  // Combine separator flag to prefix number into one number.
  return separator | prefixNumber | rawColor
}
export function colorToNumber({ colorId }) {
  if (!colorId) return null
  if (!colorId.includes(COLOR_SEPARATOR)) return Number(colorId)
  const [color1, color2] = colorId.split(COLOR_SEPARATOR)
  return (color1 << 8) | color2
}

export const getArchivePrefix = (info) => `A${toBase32(prefixToNumber(info))}`
export const getArchivePattern = ({ patternNumber }) => toBase32(patternNumber)
export const getArchiveColor = _.flow(colorToNumber, toBase32)

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

function partsToId(info) {
  const { colorId } = info
  return getItemId(getPatternId(info), colorId)
}
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
export function numberToColor(colorNum) {
  if (isColorNum(colorNum)) return padColor(colorNum)
  return null
}
export function numberToColors(colorNum) {
  if (isColorNum(colorNum)) return [colorNum]
  if (isMixedColorNum(colorNum)) return [colorNum >> 8, colorNum & 0xFF]
  return null
}
const toColorPart = _.flow(Number, numberToColor)

export function itemIdObj({ remainingParts, ...info }) {
  const colorParts = _.filter(isColorNum, remainingParts)
  const otherParts = _.pullAll(colorParts, remainingParts)
  const otherId = otherParts.length ? otherParts.join('_') : undefined
  const colorId = colorParts.length ? colorParts.map(toColorPart).join(COLOR_SEPARATOR) : null
  const result = {
    ...info,
    colorId,
    otherId,
  }
  result.errors = isItemInfoValid(result)
  if (result.errors) result.invalidId = true
  result.itemId = partsToId(result)
  if (result.input === result.itemId) delete result.input
  result.archiveId = itemInfoToArchiveId(result)
  return result
}

export function getColors(pColor, sColor) {
  if (!pColor && !sColor) return null
  let result = `${pColor || ''}, ${sColor || ''}`
  result = _.map(_.trim, result.toLowerCase().split(', '))
  return _.uniq(_.compact(result))
}

export function getColorItemColors(colorItem) {
  const { primaryColor, secondaryColor } = colorItem
  return (primaryColor || secondaryColor) ? getColors(primaryColor, secondaryColor) : undefined
}

export const createItemId = ({ patternId, colorId }) => getItemId(patternId, colorId)
export const itemIdFromPatternColorId = ({ patternId }, colorId) => getItemId(patternId, colorId)
export const getPatternIndexItemId = (pattern, colorIndex) => getItemId(
  pattern.patternId,
  pattern.colorItems[colorIndex].colorId,
)

export const getItemIdParts = _.flow(getPatternIdInfo, itemIdObj)

export const isItemId = _.flow(
  getItemIdParts,
  (x) => (!!x.patternId && !!x.colorId && !x.invalidId),
)

export function toArchiveId(itemId, colorIsRaw = false) {
  const info = getItemIdParts(itemId)
  info.colorIsRaw = colorIsRaw
  return itemInfoToArchiveId(info)
}

export function numberToPrefix(num) {
  if (num === 0) return { patternSeparator: false, patternPrefix: null }
  if (num > 0x3F) return { prefixError: true }
  const patternPrefixNumber = num & 0xF
  const patternPrefix = getPrefixFromNumber(patternPrefixNumber)
  const patternSeparator = patternPrefix && !(num & 0x10)
  const colorIsRaw = !!(num & 0x20)
  return { colorIsRaw, patternSeparator, patternPrefix }
}

function fromB32(code) {
  // Do we need to worry about 5 and S looking alike?
  return fromBase32(code.toUpperCase().replaceAll('I', 1).replaceAll('L', 1).replaceAll('O', 0))
}
const archivePrefixToNumber = (prefix) => fromB32(prefix.substring(1))
const fromArchivePrefix = _.flow(archivePrefixToNumber, numberToPrefix)
// const isValidArchivePrefix = _.flow(archivePrefixToNumber, isLt(0x20))

function archiveParts(input) {
  const [prefix, pattern, ...remaining] = splitOnSeparator(idStrPrep(input).toUpperCase())
  const { colorIsRaw, ...prefixInfo } = fromArchivePrefix(prefix)
  const colorNumbers = colorIsRaw ? null : numberToColors(fromB32(remaining[0]))
  return {
    input,
    ...prefixInfo,
    patternNumber: fromB32(pattern),
    remainingParts: colorNumbers ? colorNumbers.concat(_.tail(remaining)) : remaining,
  }
}

export const fromArchiveId = _.flow(
  archiveParts,
  addPatternInfo,
  itemIdObj,
)

function isArchiveId(itemId) {
  const parts = splitOnSeparator(idStrPrep(itemId))
  if (!parts.length) return false
  return parts[0].startsWith('a') && parts.length >= 3
}
// Convert a string into an object of itemId information
export const getItemIdInfo = _.flow(
  _.cond([
    [isArchiveId, fromArchiveId],
    [_.stubTrue, getItemIdParts],
  ]),
)
