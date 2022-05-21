import _ from 'lodash/fp.js'

// These must exactly match the values in rg-admin/categories.yaml

export const TRIM = 'trim'
export const TEXTILE = 'textile'
export const LEATHER = 'leather'
export const LINEN = 'linen'
export const DRAPERY = 'drapery'
export const INVALID = 'invalid'
export const PERFORMANCE = 'performance'

export const NO_PREFIX_CAT = TEXTILE

export const be = {
  [DRAPERY]: _.constant(DRAPERY),
  [INVALID]: _.constant(INVALID),
  [LEATHER]: _.constant(LEATHER),
  [LINEN]: _.constant(LINEN),
  [TEXTILE]: _.constant(TEXTILE),
  [TRIM]: _.constant(TRIM),
}

// The order here is important. Only add new options to the end of the list. Max of 14 options!
const categories = [
  ['l', LEATHER],
  ['p', TRIM],
  ['dl', TEXTILE],
  ['dli', LINEN],
  ['dll', LEATHER],
  ['dlt', TRIM],
  ['pf', PERFORMANCE],
]

export const categoryPrefixIds = categories.map(_.first)
export const patternPrefixCategory = new Map(categories)

export function getCategoryFromPrefix(patternPrefix, invalidId = false) {
  if (patternPrefix === null && !invalidId) return NO_PREFIX_CAT
  return patternPrefixCategory.get(patternPrefix) || INVALID
}
export function getPrefixFromNumber(patternPrefixNumber) {
  if (patternPrefixNumber === 0) return NO_PREFIX_CAT
  const prefix = categoryPrefixIds[patternPrefixNumber - 2]
  if (patternPrefixNumber === 1 || !prefix) return INVALID
  return prefix
}
export function getNumberFromPrefix(patternPrefix) {
  if (patternPrefix === null) return 0
  if (!patternPrefixCategory.get(patternPrefix)) return 1
  return categoryPrefixIds.indexOf(patternPrefix) + 2
}
