import _ from 'lodash/fp.js'
import { isGt, oneOf, onTrue } from 'understory'

const isPatternPrefix = oneOf(['dl', 'dli', 'dlt', 'p', 'l', 'pf'])
const isPatternLength = _.flow(_.size, isGt(2))
export const isPatternNumber = _.flow(Number, isGt(9))
export const isValidPatternNumber = _.overEvery([isPatternLength, isPatternNumber])
export const patternIsNumber = isValidPatternNumber
export const patternIsTextile = _.flow(_.replace(/^dl-?/, ''), isValidPatternNumber)
export const patternIsLinen = _.startsWith('dli')
export const patternIsTrim = _.overSome([_.startsWith('p-'), _.startsWith('dlt')])
export const patternIsLeather = _.overSome([_.startsWith('l-'), _.startsWith('dll')])

// Just the pattern.
export const isValidPatternChars = /^(?:dl(?:i|t)?-?|p-|l-|pf)?[0-9]{3,}$/
export const hasValidPatternFormat = (patternId) => !_.isEmpty(isValidPatternChars.exec(patternId))

// @TODO check for valid chars.
export const isPatternPart = _.overSome([
  isPatternPrefix,
  _.overEvery([isPatternLength, isPatternNumber]),
])
const getIndexOfFirstNumber = _.findIndex((x) => x.match(/\d/))
function splitAtFirstNumber(str) {
  const index = getIndexOfFirstNumber(str)
  if (index) return [str.slice(0, index), str.slice(index)]
  return [str]
}
const splitOnSeparator = _.split('-')
function splitId(id) {
  const parts = splitOnSeparator(id)
  if (parts.length > 1 && getIndexOfFirstNumber(parts[0]) > 0) {
    return [...splitAtFirstNumber(parts[0]), ..._.tail(parts)]
  }
  return parts
}
export const getItemParts = _.cond([
  [_.includes('-'), splitId],
  [_.stubTrue, splitAtFirstNumber],
])

export const idStrPrep = _.flow(
  _.toLower,
  _.replace('/', '-'), // Note: not using underscore.
  _.replace('_', '-'),
  _.replace('|', '-'),
)
export const splitItemId = _.flow(idStrPrep, getItemParts)

const isColorNum = _.flow(Number, (x) => x > 0 && x < 100)
export const prepColorParts = onTrue(isColorNum, _.flow(_.trimCharsStart('0'), _.padCharsStart('0', 2)))
const isColorPart = (part) => part.length === 2 && isColorNum(part)

// Take string and return object with patternId and remaining parts.
export function getPatternIdInfo(input) {
  const itemId = idStrPrep(input)
  const result = {
    input, patternPrefix: null, patternId: null, itemId,
  }
  const idParts = getItemParts(itemId)
  const remainingParts = [...idParts]
  // if (idParts.length === 2) return { patternid: idParts[0], colorId: idParts[1] }
  const patternParts = []
  // pattern has prefix
  if (isPatternPrefix(idParts[0])) {
    result.patternPrefix = idParts[0] // eslint-disable-line prefer-destructuring
    patternParts.push(idParts[0])
    remainingParts.shift()
    // Make sure next part is a number.
    if (!isValidPatternNumber(idParts[1])) {
      return { ...result, remainingParts }
    }
    if (splitOnSeparator(itemId).length === idParts.length) {
      patternParts.push(idParts[1])
    } else {
      patternParts[0] += idParts[1]
    }
    remainingParts.shift()
  } else if (isValidPatternNumber(idParts[0])) { // number pattern
    patternParts.push(idParts[0])
    remainingParts.shift()
  }
  result.patternId = patternParts.length ? patternParts.join('-') : null
  return _.set('remainingParts', remainingParts.map(prepColorParts), result)
}
// FULL Id with colorId
export const validIdChars = /^(?:dl(?:i|t)?-?|p-|l-|pf)?[0-9]{3,}-[0-9]{2}(?:[|-][0-9]{2})?$/

export const hasValidIdFormat = (id) => !_.isEmpty(validIdChars.exec(id)) // hasValidIdChars
export const isValidPattern = _.overEvery([
  hasValidPatternFormat,
  _.flow(splitItemId, _.every(isPatternPart)),
])

export const getItemId = _.curry((patternId, colorId) => (patternId && colorId ? `${patternId}-${colorId}` : null))

export function itemIdObj({ remainingParts, ...info }) {
  const colorParts = _.filter(isColorPart, remainingParts)
  const otherParts = _.pullAll(colorParts, remainingParts)
  const otherId = otherParts.length ? otherParts.join('_') : undefined
  const colorId = colorParts.length ? colorParts.join('|') : null
  const itemId = getItemId(info.patternId, colorId)
  const result = {
    ...info,
    colorId,
    otherId,
    invalidId: !hasValidIdFormat(itemId) || otherId ? true : undefined,
    itemId,
  }
  if (result.input === result.itemId) delete result.input
  return result
}

// Convert a string into an object of itemId information
export const getItemIdParts = _.flow(getPatternIdInfo, itemIdObj)

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
export const isItemId = _.flow(
  getItemIdParts,
  (x) => (x.patternId && x.colorId && !x.invalidId),
)
