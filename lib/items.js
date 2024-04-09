import _ from 'lodash/fp.js'
import { setField } from 'prairie'
import { normalImgPath } from './image.js'

export const ITEMS = 'colorItems'
export const COLOR_ID = 'colorId'

const addPattern = (pattern) => _.set('pattern', pattern)
// Only used to filter search results when slim.
const addCatId = (pattern) => _.set('categoryId', pattern.category)
const addAppCode = (pattern) => _.set('appCode', pattern.appCode)

export const getItem = _.curry((pattern, colorItem) => _.flow(
  addPattern(pattern),
  addCatId(pattern),
  addAppCode(pattern),
  // Only used to filter search results when slim.
  setField('imagePath', normalImgPath),
)(colorItem))

// When pattern.colorItems is an array and we want a full item that includes pattern info.
export const getItemByIndex = (pattern, colorIndex) => getItem(pattern, pattern[ITEMS][colorIndex])

// Convert pattern with colorItems to items with pattern.
export const getPatternColorItems = (fullPattern) => fullPattern[ITEMS].map(getItem(fullPattern))

// Get all (unsorted) color items from patterns. getColorItems()
export const getAllColorItems = _.flatMap(getPatternColorItems)

// This is the raw value that doesn't add the position of the color itself.
export function getItemColorPosition({ colorPosition, colorPrimary }) {
  if (_.isNumber(colorPosition)) return colorPosition
  if (colorPosition && colorPosition[colorPrimary]) return colorPosition[colorPrimary]
  return 999
}
// Add colorBasePosition onto colorPosition within the color.
export const getColorPrimaryPosition = _.curry(({ colors }, item) => {
  const { colorPrimary } = item
  const colorBasePosition = (_.get(['optPosition', colorPrimary], colors) || 20) * 1000
  const itemColorPosition = getItemColorPosition(item)
  return colorBasePosition + itemColorPosition
})

// Filter down patterns to those that contain colorItems.
// How there can be a pattern without a colorItem?!
export const getOnlyWithColors = _.filter(_.flow(_.get(ITEMS), _.size))

// These two functions need to be combined into one?
export function buildFullPatterns(colorItems) {
  function reducer(result, { pattern }) {
    // Assuming every colorItem.pattern contains all required info.
    if (!result[pattern.patternId]) {
      // eslint-disable-next-line no-param-reassign
      result[pattern.patternId] = pattern
    }
    return result
  }
  return _.values(colorItems.reduce(reducer, {}))
}
export function buildPatterns(colorItems) {
  function reducer(result, { pattern, ...colorItem }) {
    if (!result[pattern.patternId]) {
      // eslint-disable-next-line no-param-reassign
      result[pattern.patternId] = { ...pattern, colorItems: [] }
    }
    // Add complete colorItem.
    result[pattern.patternId].colorItems.push(colorItem)
    return result
  }
  return _.sortBy('name', colorItems.reduce(reducer, {}))
}

// Remove all colorPosition properties from each item of array.
const rmColorPositions = _.map(_.unset('colorPosition'))
export const keyByColorId = _.keyBy(COLOR_ID)
export const toColorItemsIndex = _.update(ITEMS, _.flow(rmColorPositions, keyByColorId))
// Turn colorItems into an array
export const toColorItems = _.update(ITEMS, _.sortBy(COLOR_ID))
export function set(key, value, pattern) {
  return toColorItems(_.set(key, value, toColorItemsIndex(pattern)))
}
