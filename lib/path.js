import _ from 'lodash/fp.js'
import {
  addField, setField, setFieldWith, updateToWhen,
} from 'prairie'

// Data imports
// import collectionInfo from '../data/collection.mjs'
// import info from '../data/info.mjs'
// Create string used for `searchHash` portion of url.

// export function init({ collectionInfo, categories, filterFields }) {
//   const {
//     defaultCategory, defaultMeta, displayStyles, pageSizes,
//   } = collectionInfo
//   const catCodeId = _.invert(categories)
//   const getCatAlias = (hash) => ((catCodeId[hash]) ? catCodeId[hash] : hash)
//   return {
//     getCatAlias,
//     searchHashEncode,
//   }
// }

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

// export function searchHashParse(filterHash) {

//   // Check to see if it's an itemId.
//   const itemParts = getItemIdParts(filterHash)
//   if (isItemParts(itemParts)) {
//     const { colorId, patternId } = itemParts
//     return { ...itemParts, matches: { patternId }, colorItem: { colorId } }
//   }
//   return {}
// }

const collectionPathParts = ['pageType', 'displayStyle', 'searchHash', 'sortSlug', 'perPage', 'currentPage']
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

export const collectionPathParse = ({ defaultMeta, ...info }) => _.flow(
  (x) => (_.isString(x) ? collectionPathToObj(x) : x),
  _.update('searchHash', searchHashPrep),
  (x) => (isDetailPg(x) ? _.set('perPage', 1, x) : x),
  _.pickBy(_.identity),
  _.defaults(defaultMeta),
  addSortSlug,
  updateToWhen(_.toNumber, _.isString, 'perPage'),
  _.update('currentPage', _.toNumber),
  setFieldWith('search', 'searchHash', searchHashParse(info)),
  ifAnonRmTg,
  setField('path', collectionPathEncode),
)
export const createCollectionUrl = (x) => (
  _.isFunction(x) ? _.flow(collectionPathParse, x, collectionPathEncode) : collectionPathEncode(x)
)
export const collectionPathParseEncode = (defaultMeta) => _.flow(collectionPathParse(defaultMeta), _.get('path'))
export const printMeta = _.flow(printPathEncode, collectionPathParse)

export const itemUrl = (defaultMeta, itemId) => collectionPathEncode(defaultMeta)({ displayStyle: 'detail', search: { itemId } })
