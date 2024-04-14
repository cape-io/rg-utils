import _ from 'lodash/fp.js'
// import { oneOf } from 'understory'
import {
  fieldCodes, fieldById,
  toOptIdSearch, filterFieldCodes, toOptCodeSearch,
} from './fields.js'
import { isItemId } from './id.js'
import { ANY_CAT } from './cat-ids.js'

export const FILTERS = 'filters'
// optIdCode would match against id instead of slug
const catHashIndexReducer = (prefix) => (result, { slug, code, id }) => _.set(
  slug || id,
  code ? prefix + code : '',
  result,
)
// Send the category field.
export function getCategoryCodes({ code, options }) {
  return options.reduce(catHashIndexReducer(code), {})
}

export const categoryCodes = getCategoryCodes(fieldById.category)
// key with search hash code.
export const catCodeId = _.invert(categoryCodes)
// export const getCatAlias = (hash) => ((catCodeId[hash]) ? catCodeId[hash] : hash)

// This uses full ids, not codes.
function getSimpleSearches() {
  const cats = fieldById.category.options
    .filter(({ id }) => !['linen', 'drapery', 'any'].includes(id))
    .map(({ id, slug }) => ([slug || id, { categoryId: id }]))
  const colors = fieldById.colors.options
    .map(({ id }) => ([`^${id}`, { matches: { colorPrimary: id } }]))

  const searches = [
    // ...catCodes,
    ...cats,
    ...colors,
    // any: {}, taken care of in searchHashParse() by isEmptySearch()
    ['performance', { designs: ['performance'] }],
  ]
  return searches
}
const simpleSearches = getSimpleSearches()
const getSimpleSearch = _.flow(
  _.fromPairs,
)
export const simpleSearch = getSimpleSearch(simpleSearches)

const SEARCH_Q_STR = 'sr'
const FILTER_SPLIT_ON = '_'
const SEARCH_Q_KEY = 'query'
export const SEARCH_Q_PATH = ['search', SEARCH_Q_KEY]
const SEARCH_STUB = {
  filters: {},
  // [SEARCH_Q_KEY]: undefined,
}
// Is it ever not a string we pass this function?
const removeExtraBlankSuff = _.flow(
  _.replace(/\s?\s+/g, ' '),
  _.trimStart,
)

const aliasIndex = {
  summersale: 'tgdd',
  trim: 'passementerie',
}
const replaceAlias = (x) => (aliasIndex[x] || x)

export function queryEncode(query = '', shouldPrefix = true) {
  if (!query) return ''
  const str = _.flow(
    removeExtraBlankSuff,
    _.toLower,
    encodeURIComponent,
  )(query)
  if (!str) return ''
  return shouldPrefix ? SEARCH_Q_STR + str : str
}

// function addFilterCode(filters) {
//   return (code) => {
//     const values =
//   }
// }
// Search through all filter fields

// filters must already be short codes.
function filtersEncode(codes, filters) {
  if (!filters) return []
  return codes
    .filter((code) => !_.isEmpty(filters[code]))
    .map((code) => code + filters[code].sort().join(''))
}

// This can be sent a search object of the codes or ids.
export function searchHashEncodeRaw(
  {
    categorySlug, filters, itemId, query,
  },
) {
  if (categorySlug) return categorySlug
  if (itemId && _.isEmpty(filters) && !query) return itemId
  // // Convert ids to codes.
  const filtersByCodes = toOptCodeSearch(filters)
  // console.log(filters, filtersByCodes)
  const filterCodes = filtersEncode(filterFieldCodes, filtersByCodes)
  const queryCode = queryEncode(query || itemId, filterCodes.length)
  const hash = _.compact(filterCodes.concat(queryCode)).join(FILTER_SPLIT_ON)
  return hash || ANY_CAT
}

const getSearchAliasIndex = _.flow(
  _.map(([id, filters]) => ([searchHashEncodeRaw({ filters }), id])),
  _.fromPairs,
  _.unset('any'),
)
export const searchAliasIndex = getSearchAliasIndex(simpleSearches)

export const getSearchAlias = _.propertyOf(searchAliasIndex)

export const searchHashEncode = _.flow(searchHashEncodeRaw, (x) => getSearchAlias(x) || x)

const isEmptySearch = (x) => (!x || x === '[...]' || x === ANY_CAT)
function addFieldFilters(result, fieldStr) {
  if (!fieldStr) return result
  // console.log('addFieldFilters', JSON.stringify(fieldStr))
  const [fieldId, ...fieldFilters] = _.trim(fieldStr).match(/.{1,2}/g)
  return _.set([FILTERS, fieldId], fieldFilters, result)
}

export const searchHashPrep = _.flow(removeExtraBlankSuff, replaceAlias, decodeURIComponent)
// Returns full ids not codes based on toIds flag.
export function searchHashParse(searchHash, toIds = true) {
  const filterHash = searchHashPrep(searchHash)
  if (isEmptySearch(filterHash)) return SEARCH_STUB
  if (filterHash === '[...]' || filterHash === ANY_CAT) return SEARCH_STUB
  // Alias for simple basic searches.
  if (_.has(filterHash, simpleSearch)) {
    return _.set(FILTERS, _.get(filterHash, simpleSearch), SEARCH_STUB)
  }
  // Check if it is a valid itemId attempt
  if (isItemId(filterHash)) {
    return { ...SEARCH_STUB, itemId: filterHash, [SEARCH_Q_KEY]: filterHash }
  }
  if (filterHash[0] === '^') {
    return { ...SEARCH_STUB, [SEARCH_Q_KEY]: filterHash.slice(1), prefix: true }
  }
  // return early if no filters.
  if (!fieldCodes[filterHash.slice(0, 2)]) {
    return _.set(SEARCH_Q_KEY, filterHash, SEARCH_STUB)
  }
  // Parse all parts.
  function reducer(result, fieldStr) {
    // Check if this is a query part.
    if (fieldStr.startsWith(SEARCH_Q_STR)) {
      return _.set(SEARCH_Q_KEY, fieldStr.slice(2), result)
    }
    return addFieldFilters(result, fieldStr)
  }
  // shortCode filters
  const filterCodes = filterHash.split(FILTER_SPLIT_ON).reduce(reducer, SEARCH_STUB)
  return toIds ? _.update(FILTERS, toOptIdSearch, filterCodes) : filterCodes
}
export const getSearchQuery = _.getOr('', SEARCH_Q_PATH)
export const setSearchQuery = _.set(SEARCH_Q_PATH)

function searchFilterAdjust(thunk) {
  return (searchHash, filterId, valueId) => {
    const search = searchHashParse(searchHash)
    const filterVals = _.getOr([], [FILTERS, filterId], search)
    const searchFilters = thunk(filterVals, valueId)
    const nextSearch = _.set([FILTERS, filterId], searchFilters, search)
    const nextHash = searchHashEncode(nextSearch)
    return (searchHash === nextHash) ? null : nextHash
  }
}
export const addSearchFilter = searchFilterAdjust((vals, newVal) => _.union(
  vals,
  (_.isArray(newVal) ? newVal : [newVal]),
))
export const rmSearchFilter = searchFilterAdjust((vals, newVal) => _.without(
  (_.isArray(newVal) ? newVal : [newVal]),
  vals,
))
