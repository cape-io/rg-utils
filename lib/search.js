import _ from 'lodash/fp.js'
import { propDo, setField } from 'prairie'
import { getOnlyWithColors } from './items.js'
import { hasImagePath } from './image.js'
// import { ANY_CAT } from './cat-ids.js'

const SEARCH_PATTERN = ['name', 'patternId']
const SEARCH_COLOR = ['color']

// based on full colorItem
const CONTENTS = 'pattern.contents'
const DESIGNS = 'pattern.designs'
const COLORS = 'colors'
export const filterFields = [COLORS, CONTENTS, DESIGNS]

export const searchFields = [
  'itemId', 'color',
  // Is there a way to search on the pattern first? Not sure it saves much actually.
  'pattern.category', 'pattern.name', 'pattern.originCountry', // 'pattern.content',
  ...filterFields,
]
export const storeFields = ['categoryId', 'imagePath', 'pattern.name', ...filterFields]

const zeroDiff = (x) => _.flow(_.difference(x), _.size, _.isEqual(0))
export const checkValThunk = (x) => (_.isArray(x) ? zeroDiff(x) : _.includes(x))

export function createFilterFunc({
  colors, conforms, contents, designs, hasImage, match,
}) {
  const filters = []
  if (match) filters.push(_.matches(match))
  if (conforms) filters.push(_.conforms(conforms))
  if (hasImage) filters.push(hasImagePath)
  if (colors) filters.push(propDo(COLORS, checkValThunk(colors)))
  if (contents) filters.push(propDo(CONTENTS, checkValThunk(contents)))
  if (designs) filters.push(propDo(DESIGNS, checkValThunk(designs)))
  return filters.length ? _.overEvery(filters) : null
}

export const addSearchField = setField(
  'search',
  (item) => _.at(SEARCH_PATTERN, item)
    .concat(...item.colorItems.map(_.at(SEARCH_COLOR)))
    .join(' ').toLowerCase(),
)
function createFilter({ showDiscontinued, showWithoutImagesOnly }) {
  return _.conforms({
    discontinued: _.eq(showDiscontinued),
    images: showWithoutImagesOnly ? _.eq(0) : _.stubTrue,
  })
}
export function filterPatterns(items, input, filters) {
  const itemsOfStatus = getOnlyWithColors(_.map(_.update('colorItems', _.filter(createFilter(filters))), items))
  if (!input) return itemsOfStatus
  const searchTerms = input.toLowerCase().split(' ')
  const doSearch = ({ search }) => _.every((term) => search.indexOf(term) !== -1, searchTerms)
  return itemsOfStatus.filter(doSearch)
}

export function extractField(item, fieldId) {
  const value = _.get(fieldId, item)
  if (_.isArray(value)) return value.join(' ')
  return value
}
