import _ from 'lodash/fp.js'
import { propDo } from 'prairie'
import { oneOf } from 'understory'
import {
  patternIsLeather, patternIsLinen, patternIsTextile, patternIsTrim,
} from './id.js'
import {
  be, ANY_CAT, DRAPERY, INVALID, LEATHER, LINEN, TEXTILE, TRIM,
} from './cat-ids.js'
import { catsById } from './fields.js'

// DRAPERY
const patternIsDrapery = ({ patternIds }) => oneOf(patternIds)
export const isDrapery = (draperyInfo) => propDo('patternId', patternIsDrapery(draperyInfo))

// INVALID
export function isInvalid(x) {
  if ((!x.patternId && !x.colorId) || x.otherId || !x.category) return true
  return [ANY_CAT, INVALID].includes(x.category)
}

// Only checks for category, even if pattern number is otherwise invalid. //

// LEATHER
const leatherNames = ['leather', 'leathr', 'lthr']
export const includesLeather = _.overSome(_.map(_.includes, leatherNames))
const isLeatherName = propDo(
  'name',
  _.overEvery([_.isString, _.flow(_.lowerCase, includesLeather)]),
)
export const isLeather = _.overSome([
  propDo('category', _.flow(_.lowerCase, oneOf(leatherNames))),
  propDo('patternId', patternIsLeather),
  isLeatherName,
])

// LINEN
export const isLinen = _.overSome([
  propDo('category', _.flow(_.lowerCase, _.includes('linen'))),
  propDo('patternId', patternIsLinen),
])

// TEXTILE
export const isTextile = _.overSome([
  propDo('category', _.flow(_.lowerCase, _.startsWith('texti'))),
  propDo('patternId', patternIsTextile),
])

// TRIM
const isTrimCat = _.overSome([
  _.startsWith('passem'),
  _.startsWith('pasem'),
  _.includes('trim'),
])
export const isTrim = _.overSome([
  propDo('category', isTrimCat),
  propDo('patternId', patternIsTrim),
])

// getCategory(item) Using `category` field, not categoryId!
export const getCategory = _.cond([
  [isTrim, be[TRIM]],
  [isLeather, be[LEATHER]],
  [isLinen, be[LINEN]],
  [isDrapery(catsById.drapery), be[DRAPERY]],
  [isTextile, be[TEXTILE]],
  [isInvalid, be[INVALID]],
  [_.stubTrue, _.flow(_.get('category'), _.lowerCase)],
])
