import _ from 'lodash/fp.js'
import { doProp, propDo } from 'prairie'
import { oneOf } from 'understory'
import { patternIsTextile } from '../rg-id.js'

// These must exactly match the values in rg-admin/categories.yaml

export const TRIM = 'trim'
export const TEXTILE = 'textile'
export const LEATHER = 'leather'
export const LINEN = 'linen'
export const DRAPERY = 'drapery'
export const INVALID = 'invalid'

export const be = {
  [DRAPERY]: _.constant(DRAPERY),
  [INVALID]: _.constant(INVALID),
  [LEATHER]: _.constant(LEATHER),
  [LINEN]: _.constant(LINEN),
  [TEXTILE]: _.constant(TEXTILE),
  [TRIM]: _.constant(TRIM),
}

// DRAPERY
const patternIsDrapery = ({ patternIds }) => oneOf(patternIds)
export const isDrapery = (draperyInfo) => propDo('patternId', patternIsDrapery(draperyInfo))

// INVALID
export const isInvalid = (x) => (!x.patternId && !x.colorId) || x.otherId || !x.category

// LEATHER
const patternIsLeather = _.overSome([_.startsWith('l-'), _.startsWith('dll')])
const isLeatherName = propDo('name',
  _.overEvery([_.isString, _.flow(_.lowerCase, _.includes('leather'))]),
)
export const isLeather = _.overSome([
  propDo('category', _.flow(_.lowerCase, _.includes('leather'))),
  propDo('patternId', patternIsLeather),
  isLeatherName,
])

// LINEN
const patternIsLinen = _.startsWith('dli')
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
const patternIsTrim = _.overSome([_.startsWith('p-'), _.startsWith('dlt')])
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
  [isTextile, be[TEXTILE]],
  [isTrim, be[TRIM]],
  [isLeather, be[LEATHER]],
  [isLinen, be[LINEN]],
  [isDrapery(categories.drapery), be[DRAPERY]],
  [isInvalid, be[INVALID]],
  [_.stubTrue, _.flow(_.get('category'), _.lowerCase)],
])

// create getPatternCategory. Make note if using this.
export const getCategoryFromPattern = ({ categories }) => _.cond([
  [patternIsTextile, be[TEXTILE]],
  [patternIsTrim, be[TRIM]],
  [patternIsLeather, be[LEATHER]],
  [patternIsLinen, be[LINEN]],
  [patternIsDrapery(categories.drapery), be[DRAPERY]],
  [_.stubTrue, be[INVALID]],
])
