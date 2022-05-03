import _ from 'lodash/fp.js'
import { isGt, oneOf, onTrue } from 'understory'

const isPatternPrefix = oneOf(['dl', 'dli', 'dlt', 'p', 'l', 'pf'])
const isPatternLength = _.flow(_.size, isGt(2))
export const isPatternNumber = _.flow(Number, isGt(9))
export const isValidPatternNumber = _.overEvery([isPatternLength, isPatternNumber])
export const patternIsNumber = _.flow(_.replace(/^dli?t?/, ''), isValidPatternNumber)
export const patternIsTextile = _.flow(_.replace(/^dl-?/, ''), isValidPatternNumber)

// Just the pattern.
export const isValidPatternChars = /^(?:dl(?:i|t)?-?|p-|l-|pf)?[0-9]{3,}$/
export const hasValidPatternFormat = (patternId) => !_.isEmpty(isValidPatternChars.exec(patternId))

// @TODO check for valid chars.
export const isPatternPart = _.overSome([
  isPatternPrefix,
  _.overEvery([isPatternLength, isPatternNumber]),
])

function splitAtFirstNumber(str) {
  const index = _.findIndex((x) => x.match(/\d/), str)
  if (index) return [str.slice(0, index), str.slice(index)]
  return [str]
}
export const getItemParts = _.cond([
  [_.includes('-'), _.split('-')],
  [_.stubTrue, splitAtFirstNumber],
])

export const idStrPrep = _.flow(
  _.toLower,
  _.replace('/', '-'), // Note: not using underscore.
  _.replace('_', '-'),
  _.replace('|', '-'),
)

const isColorNum = _.flow(Number, (x) => x > 0 && x < 100)
export const prepColorParts = onTrue(isColorNum, _.flow(_.trimCharsStart('0'), _.padCharsStart('0', 2)))
const isColorPart = (part) => part.length === 2 && isColorNum(part)

// Take string and return object with patternId and remaining parts.
export function getPatternIdInfo(str) {
  const id = idStrPrep(str)
  const idParts = getItemParts(id)
  // if (idParts.length === 2) return { patternid: idParts[0], colorId: idParts[1] }
  const patternParts = []
  if (isPatternPrefix(idParts[0])) {
    patternParts.push(idParts[0])
    if (!patternIsNumber(idParts[1])) return { remainingParts: idParts, patternId: null }
    patternParts.push(idParts[1])
  } else if (patternIsNumber(idParts[0])) {
    patternParts.push(idParts[0])
  }

  const patternId = patternParts.length ? patternParts.join('-') : null
  if (!isPatternLength(patternId)) return { remainingParts: idParts, patternId: null }
  const remainingParts = _.pullAll(patternParts, idParts).map(prepColorParts)
  return { remainingParts, patternId }
}
// FULL Id with colorId
export const validIdChars = /^(?:dl(?:i|t)?-?|p-|l-|pf)?[0-9]{3,}-[0-9]{2}(?:[|-][0-9]{2})?$/

export const hasValidIdFormat = (id) => !_.isEmpty(validIdChars.exec(id)) // hasValidIdChars
export const isValidPattern = _.overEvery([
  hasValidPatternFormat,
  _.flow(getItemParts, _.every(isPatternPart)),
])
export function itemIdObj({ remainingParts, patternId }) {
  const colorParts = _.filter(isColorPart, remainingParts)
  const otherParts = _.pullAll(colorParts, remainingParts)
  return {
    patternId,
    colorId: colorParts.length ? colorParts.join('|') : null,
    otherId: otherParts.length ? otherParts.join('_') : undefined,
  }
}

export function getItemIdParts(str) {
  const itemId = idStrPrep(str)
  const result = itemIdObj(getPatternIdInfo(itemId))
  if (!hasValidIdFormat(itemId) || result.otherId) result.invalidId = true
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

export const getItemId = _.curry((patternId, colorId) => `${patternId}-${colorId}`)
export const createItemId = ({ patternId, colorId }) => getItemId(patternId, colorId)
export const itemIdFromPatternColorId = ({ patternId }, colorId) => getItemId(patternId, colorId)
export const getPatternIndexItemId = (pattern, colorIndex) => getItemId(
  pattern.patternId,
  pattern.colorItems[colorIndex].colorId,
)
export const isItemId = _.flow(
  getItemIdParts,
  (x) => (x.patternId && x.colorId && !x.otherId),
)
