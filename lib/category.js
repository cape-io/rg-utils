import _ from 'lodash/fp.js'
import { propDo } from 'prairie'
import { oneOf } from 'understory'
import {
  isPatternNumber, patternIsLeather, patternIsLinen, patternIsTextile, patternIsTrim,
} from './id.js'
import {
  be, DRAPERY, INVALID, LEATHER, LINEN, TEXTILE, TRIM,
} from './cat-ids.js'

// DRAPERY
const patternIsDrapery = ({ patternIds }) => oneOf(patternIds)
export const isDrapery = (draperyInfo) => propDo('patternId', patternIsDrapery(draperyInfo))

// INVALID
export const isInvalid = (x) => (!x.patternId && !x.colorId) || x.otherId || !x.category

// LEATHER
const isLeatherName = propDo(
  'name',
  _.overEvery([_.isString, _.flow(_.lowerCase, _.includes('leather'))]),
)
export const isLeather = _.overSome([
  propDo('category', _.flow(_.lowerCase, _.includes('leather'))),
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

// create getCategory. Use category field before patternId field.
export const getCategory = ({ categories }) => _.cond([
  [isTrim, be[TRIM]],
  [isLeather, be[LEATHER]],
  [isLinen, be[LINEN]],
  [isDrapery(categories.drapery), be[DRAPERY]],
  [isTextile, be[TEXTILE]],
  [isInvalid, be[INVALID]],
  [_.stubTrue, _.flow(_.get('category'), _.lowerCase)],
])

// create getPatternCategory. Make note if using this.
export const getCategoryFromPattern = ({ categories }) => _.cond([
  [isPatternNumber, be[TEXTILE]],
  [patternIsTrim, be[TRIM]],
  [patternIsLeather, be[LEATHER]],
  [patternIsLinen, be[LINEN]],
  [patternIsDrapery(categories.drapery), be[DRAPERY]],
  [_.stubTrue, be[INVALID]],
])

// export function getMetaCatId(() => { search: { filters } }) {
//   const catFilter = filters[catFilterCode]
//   if (catFilter && catFilter.length === 1) return catsByCode[catFilter[0]].id
//   return catsById[ANY_CAT].id
// }
