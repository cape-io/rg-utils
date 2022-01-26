import _ from 'lodash/fp.js'
import { isGt, oneOf, onTrue } from 'understory'

const isPatternPrefix = oneOf(['p', 'l', 'dl'])
const isPatternLength = _.flow(_.size, isGt(3))
export const isPatternNumber = _.flow(Number, isGt(10))
export const patternIsNumber = _.flow(
  _.replace(/dli?t?/, ''),
  _.overEvery([isPatternLength, isPatternNumber]),
)
// @TODO check for valid chars.
export const isPatternPart = _.overSome([isPatternPrefix, patternIsNumber])

const getItemParts = _.split('-')

export const idStrPrep = _.flow(
  _.toLower,
  _.replace('/', '-'), // Note: not using underscore.
  _.replace('_', '-'),
  _.replace('|', '-'),
)

const isNum = (x) => Number(x) > 0
const isColorPart = (part) => part.length === 2 && isNum(part)
export const prepColorParts = onTrue(isNum, _.flow(_.trimCharsStart('0'), _.padCharsStart('0', 2)))

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

export const validIdChars = /^(?:dl(?:i|t)?|p-|l-)?[0-9]{4,}-[0-9]{2}(?:[|-][0-9]{2})?$/
export const hasValidIdFormat = (id) => !_.isEmpty(validIdChars.exec(id))

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
