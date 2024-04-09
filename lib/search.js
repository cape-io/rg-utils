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
export const storeFields = ['pattern.appCode', 'categoryId', 'imagePath', 'pattern.name', 'discontinued', ...filterFields]

const zeroDiff = (x) => _.flow(_.difference(x), _.size, _.isEqual(0))
export const checkValThunk = (x) => (_.isArray(x) ? zeroDiff(x) : _.includes(x))

// send it an object of filters.
export function createFilterFunc({
  categoryId, colors, conforms, contents, designs, hasImage, matches,
}) {
  const filters = []
  if (categoryId) filters.push(propDo('categoryId', _.eq(categoryId)))
  if (matches) filters.push(_.matches(matches))
  if (conforms) filters.push(_.conforms(conforms))
  if (hasImage) filters.push(hasImagePath)
  // Assume AND for these...
  if (colors) filters.push(propDo(COLORS, checkValThunk(colors)))
  if (contents) filters.push(propDo(CONTENTS, checkValThunk(contents)))
  if (designs) filters.push(propDo(DESIGNS, checkValThunk(designs)))
  // @TODO tags
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
