import _ from 'lodash/fp.js'
import { isGt, oneOf } from 'understory'

const isPatternPrefix = oneOf(['p', 'l', 'dl'])
const isPatternLength = _.flow(_.size, isGt(3))
const isPatternNumber = _.flow(Number, isGt(10))
export const patternIsTextile = _.flow(
  _.replace('dl', ''),
  _.overEvery([isPatternLength, isPatternNumber]),
)

export const isPatternPart = _.overSome([
  isPatternPrefix,
  patternIsTextile,
])

const getItemParts = _.split('-')

const idStrPrep = _.flow(
  _.toLower,
  _.replace('/', '-'), // Note: not using underscore.
)

const isColorPart = (part) => part.length === 2 && Number(part) > 0

// Take string and return object with patternId and remaining parts.
export function getPatternIdInfo(str) {
  const id = idStrPrep(str)
  const idParts = getItemParts(id)
  // if (idParts.length === 2) return { patternid: idParts[0], colorId: idParts[1] }
  const patternParts = _.filter(isPatternPart, idParts)
  const patternId = patternParts.length ? patternParts.join('-') : null
  const remainingParts = _.pullAll(patternParts, idParts)
  return { remainingParts, patternId } 
}

export const validIdChars = /^D?[dlpDLP0-9][-l0-9]{6,}$/
export const hasValidIdChars = (id) => id.includes('-') && !_.isEmpty(validIdChars.exec(id))

export function itemIdObj({ remainingParts, patternId }) {
  const colorParts = _.filter(isColorPart, remainingParts)
  const otherParts = _.pullAll(colorParts, remainingParts)
  return {
    patternId,
    colorId: colorParts.length ? colorParts.join('-') : null,
    otherId: otherParts.length ? otherParts.join('-') : undefined,
  }
}

export function getItemIdParts(str) {
  if (!hasValidIdChars(str)) return {}
  return itemIdObj(getPatternIdInfo(str))
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
