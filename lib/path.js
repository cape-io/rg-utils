import _ from 'lodash/fp.js'
import { oneOf } from 'understory'
import {
  addField, setField, setFieldWith, updateToWhen,
} from 'prairie'
import { isItemId } from './id.js'

// Data imports
// import collectionInfo from '../data/collection.mjs'
// import info from '../data/info.mjs'
// import { filterFields } from '../data/filter-fields.js'
// Create string used for `searchHash` portion of url.

const SEARCH_Q_STR = 'sr'
const FILTER_SPLIT_ON = '_'
const SEARCH_Q_KEY = 'query'
export const SEARCH_Q_PATH = ['search', SEARCH_Q_KEY]
export const ANY_CAT = 'any'
const SEARCH_STUB = {
  filters: {},
  // [SEARCH_Q_KEY]: undefined,
}

// Is it ever not a string we pass this function?
const removeExtraBlankSuff = _.replace(/\s?\s+/g, ' ')

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
function filtersEncode(filterFields, filters) {
  if (!filters) return []
  return filterFields
    .filter(({ code }) => !_.isEmpty(filters[code]))
    .map(({ code }) => code + filters[code].join(''))
}
export function searchHashEncode(
  { filterFields, getCatAlias },
  {
    categorySlug, filters, itemId, query,
  },
) {
  if (categorySlug) return categorySlug
  if (itemId && _.isEmpty(filters) && !query) return itemId
  const filterCodes = filtersEncode(filterFields, filters)
  const queryCode = queryEncode(query || itemId, filterCodes.length)
  const hash = _.compact(filterCodes.concat(queryCode)).join(FILTER_SPLIT_ON)
  return hash ? getCatAlias(hash) : ANY_CAT
}

export function init({ collectionInfo, categories, filterFields }) {
  const {
    defaultCategory, defaultMeta, displayStyles, pageSizes,
  } = collectionInfo
  const catCodeId = _.invert(categories)
  const getCatAlias = (hash) => ((catCodeId[hash]) ? catCodeId[hash] : hash)
  return {
    getCatAlias,
    searchHashEncode,
  }
}

function createMap(items, key = 'value') {
  return new Map(items.map((x) => [x[key], true]))
}
function createMapHas(items, key = 'value') {
  const mapIndex = createMap(items, key)
  return (value) => mapIndex.has(value)
}
export const isCollectionPg = (pathname) => pathname.startsWith(`/${defaultMeta.pageType}/`)
export const isValidPgSize = (pageSizes) => createMapHas(pageSizes)
const pageSizeMax = (pageSizes) => _.last(pageSizes)
function createDisplayMap(items) {
  const mapIndex = new Map(items.map((x) => [x.value, createMap(x.sortByOptions)]))
  return (value, sortBy) => (
    sortBy ? mapIndex.has(value) && mapIndex.get(value).has(sortBy)
      : mapIndex.get(value).keys().next().value
  )
}
// optional 2nd arg as sort will reply true/false if it's valid.
export const getDisplaySort = (displayStyles) => createDisplayMap(displayStyles)
export const displayStylesByValue = (displayStyles) => _.keyBy('value', displayStyles)
export const getDisplayInfo = _.propertyOf(displayStylesByValue)

function addFieldFilters(result, fieldStr) {
  if (!fieldStr) return result
  // console.log('addFieldFilters', JSON.stringify(fieldStr))
  const [fieldId, ...fieldFilters] = fieldStr.match(/.{1,2}/g)
  return _.set(['filters', fieldId], fieldFilters, result)
}
export function getCategorySearch(categories, categorySlug) {
  return addFieldFilters(SEARCH_STUB, categories[categorySlug])
}
const replaceAlias = (x) => (x === 'summersale' ? 'tgdd' : x) // tgdd

const isFilterPrefix = (filterFields) => oneOf(filterFields.map(_.get('code')))

function searchHashParse(filterHash = 'any') {
  if (!filterHash) return SEARCH_STUB
  if (filterHash === '[...]' || filterHash === ANY_CAT) return SEARCH_STUB
  if (_.has(filterHash, categories)) return getCategorySearch(filterHash)
  // console.log(isCategorySlug, JSON.stringify(filterHash))
  if (isItemId(filterHash)) {
    return { ...SEARCH_STUB, itemId: filterHash, [SEARCH_Q_KEY]: filterHash }
  }
  if (!isFilterPrefix(filterHash.slice(0, 2))) return _.set(SEARCH_Q_KEY, filterHash, SEARCH_STUB)
  if (!filterHash) return SEARCH_STUB
  function reducer(result, fieldStr) {
    if (fieldStr.startsWith(SEARCH_Q_STR)) return _.set(SEARCH_Q_KEY, fieldStr.slice(2), result)
    return addFieldFilters(result, fieldStr)
  }
  return filterHash.split(FILTER_SPLIT_ON).reduce(reducer, SEARCH_STUB)
}

const collectionPathParts = ['pageType', 'searchHash', 'displayStyle', 'sortSlug', 'perPage', 'currentPage']
const detailPathParts = collectionPathParts.slice(0, -3)
export const collectionPathToObj = _.flow(
  _.split('/'),
  _.tail,
  _.zipObject(collectionPathParts),
)
export const isDetailPg = _.flow(_.get('displayStyle'), _.startsWith('detail'))
const isItemPg = _.overEvery([_.get('search.itemId'), isDetailPg])

const addSortSlug = addField('sortSlug', _.flow(_.get('displayStyle'), getDisplaySort))
// See collectionPathParts array above for props you can send this function
export const collectionPathEncode = (defaultMeta) => _.flow(
  _.defaults({ search: {} }),
  (meta) => (meta.categorySlug ? _.set('search.categorySlug', meta.categorySlug, meta) : meta),
  setFieldWith('searchHash', 'search', searchHashEncode),
  _.defaults(defaultMeta),
  addSortSlug,
  (meta) => _.at(isItemPg(meta) ? detailPathParts : collectionPathParts, meta),
  _.join('/'),
  _.add('/'),
)
export const createCollectionUrl = (x) => (
  _.isFunction(x) ? _.flow(collectionPathParse, x, collectionPathEncode) : collectionPathEncode(x)
)
export const printPathEncode = (categorySlug) => collectionPathEncode({
  categorySlug,
  displayStyle: 'list',
  perPage: pageSizeMax.value,
  pageType: 'print-pdf',
})
function ifAnonRmTg(info) {
  const { isAnon } = info
  if (isAnon) return _.unset('search.filters.tg', info)
  return info
}

export const collectionPathParsePrep = (x, isAnon) => _.set('pathInput', x, _.set('isAnon', isAnon, collectionPathToObj(x)))

export const searchHashPrep = _.flow(removeExtraBlankSuff, replaceAlias, decodeURIComponent)
export const collectionPathParse = (defaultMeta) => _.flow(
  (x) => (_.isString(x) ? collectionPathToObj(x) : x),
  _.update('searchHash', searchHashPrep),
  (x) => (isDetailPg(x) ? _.set('perPage', 1, x) : x),
  _.pickBy(_.identity),
  _.defaults(defaultMeta),
  addSortSlug,
  updateToWhen(_.toNumber, _.isString, 'perPage'),
  _.update('currentPage', _.toNumber),
  setFieldWith('search', 'searchHash', searchHashParse),
  ifAnonRmTg,
  setField('path', collectionPathEncode),
)

export const collectionPathParseEncode = (defaultMeta) => _.flow(collectionPathParse(defaultMeta), _.get('path'))
export const printMeta = _.flow(printPathEncode, collectionPathParse)

export const itemUrl = (defaultMeta, itemId) => collectionPathEncode(defaultMeta)({ displayStyle: 'detail', search: { itemId } })
export const getSearchQuery = _.getOr('', SEARCH_Q_PATH)
export const setSearchQuery = _.set(SEARCH_Q_PATH)

export const getImgPath = (patternId, colorId, keyword) => `pattern/${patternId}/${colorId}-${keyword}.jpg`
export const itemImgPath = (
  { pattern: { patternId }, colorId },
  keyword,
) => getImgPath(patternId, colorId, keyword)
export const getNormalImg = _.find({ keyword: 'normal' })
export const normalImgPath = (x) => (getNormalImg(x.images) ? itemImgPath(x, 'normal') : null)
