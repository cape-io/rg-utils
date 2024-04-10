import _ from 'lodash/fp.js'
import {
  fieldCodes, simpleSearch, toOptIdSearch, getCatAlias, filterFieldCodes, toOptCodeSearch,
} from './fields.js'
import { isItemId } from './id.js'
import { ANY_CAT } from './cat-ids.js'

const SEARCH_Q_STR = 'sr'
const FILTER_SPLIT_ON = '_'
const SEARCH_Q_KEY = 'query'
export const SEARCH_Q_PATH = ['search', SEARCH_Q_KEY]
const SEARCH_STUB = {
  filters: {},
  // [SEARCH_Q_KEY]: undefined,
}
// Is it ever not a string we pass this function?
const removeExtraBlankSuff = _.replace(/\s?\s+/g, ' ')

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
// filters must already be short codes.
function filtersEncode(filterFieldCodes, filters) {
  if (!filters) return []
  return filterFieldCodes
    .filter((code) => !_.isEmpty(filters[code]))
    .map((code) => code + filters[code].join(''))
}

export function searchHashEncode(
  {
    categorySlug, filters, itemId, query,
  },
) {
  if (categorySlug) return categorySlug
  if (itemId && _.isEmpty(filters) && !query) return itemId
  const filtersByCodes = toOptCodeSearch(filters)
  const filterCodes = filtersEncode(filterFieldCodes, filtersByCodes)
  const queryCode = queryEncode(query || itemId, filterCodes.length)
  const hash = _.compact(filterCodes.concat(queryCode)).join(FILTER_SPLIT_ON)
  return hash ? getCatAlias(hash) : ANY_CAT
}

const isEmptySearch = (x) => (!x || x === '[...]' || x === ANY_CAT)
function addFieldFilters(result, fieldStr) {
  if (!fieldStr) return result
  // console.log('addFieldFilters', JSON.stringify(fieldStr))
  const [fieldId, ...fieldFilters] = fieldStr.match(/.{1,2}/g)
  return _.set(['filters', fieldId], fieldFilters, result)
}

export const searchHashPrep = _.flow(removeExtraBlankSuff, replaceAlias, decodeURIComponent)
export function searchHashParse(searchHash, toIds = true) {
  const filterHash = searchHashPrep(searchHash)
  if (isEmptySearch(filterHash)) return SEARCH_STUB
  if (filterHash === '[...]' || filterHash === ANY_CAT) return SEARCH_STUB
  // Alias for simple basic searches.
  if (_.has(filterHash, simpleSearch)) {
    return _.set('filters', _.get(filterHash, simpleSearch), SEARCH_STUB)
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
    if (fieldStr.startsWith(SEARCH_Q_STR)) return _.set(SEARCH_Q_KEY, fieldStr.slice(2), result)
    return addFieldFilters(result, fieldStr)
  }
  // shortCode filters
  const filterCodes = filterHash.split(FILTER_SPLIT_ON).reduce(reducer, SEARCH_STUB)
  return toIds ? _.update('filters', toOptIdSearch, filterCodes) : filterCodes
}
export const getSearchQuery = _.getOr('', SEARCH_Q_PATH)
export const setSearchQuery = _.set(SEARCH_Q_PATH)
