import _ from 'lodash/fp.js'

// Convert pattern with colorItems to items with pattern.
export function getPatternColorItems(fullPattern) {
  const { colorItems, ...pattern } = fullPattern
  return _.map(_.set('pattern', pattern), colorItems)
}
export const getAllColorItems = _.flatMap(getPatternColorItems)

export function getItemColorPosition({ colorPosition, colorPrimary }) {
  if (_.isNumber(colorPosition)) return colorPosition
  if (colorPosition && colorPosition[colorPrimary]) return colorPosition[colorPrimary]
  return 999
}
export function getColorPrimaryPosition({ colors }, item) {
  const { colorPrimary } = item
  const colorBasePosition = (_.get(['optPosition', colorPrimary], colors) || 20) * 1000
  const itemColorPosition = getItemColorPosition(item)
  return colorBasePosition + itemColorPosition
}
export const getOnlyWithColors = _.filter(_.flow(_.get('colorItems'), _.size))
