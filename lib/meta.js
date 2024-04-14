import _ from 'lodash/fp.js'
import { setFieldWith } from 'prairie'
import { searchHashParse } from './search-hash.js'
import { getPagerMeta } from './pager.js'

// @TODO this pagerInfo should move to the app!?
export const pagerInfo = {
  defaultPgSizeIndex: 1,
  pgSizeMultiplier: 12,
  pgSizes: [
    4, // This size should go away soon?
    8,
    24,
    417,
  ],
}
export const PAGER_META = getPagerMeta(pagerInfo)
// @TODO this pagerInfo should move to the app!?
export const DEFAULT_META = {
  pager: {
    currentPage: 1,
    perPage: PAGER_META.perPageDefault,
  },
  displayStyle: 'grid',
  pageType: 'collection',
}

// web application info.
const appInfo = {
  archive: {
    appId: 'archive', // web application id
    siteId: 'archivefinetextiles',
    search: { filters: { matches: { discontinued: true } } },
    isArchive: true,
  },
  rg: {
    appId: 'rg',
    siteId: 'rogersandgoffigon',
    search: { filters: { matches: { discontinued: false, appCode: 'rg' } } },
  },
  dl: {
    appId: 'dl',
    siteId: 'delanyandlong',
    search: { filters: { matches: { discontinued: false, appCode: 'dl' } } },
  },
  admin: {
    siteId: 'admin',
  },
}

// send full URL object
export function getUrlInfo({ hostname }, isAdmin = false) {
  if (isAdmin) return appInfo.admin
  if (hostname.includes('dl') || hostname.includes('delanyandlong')) {
    return appInfo.dl
  }
  if (hostname.includes('archive')) {
    return appInfo.archive
  }
  return appInfo.rg
}

export const parseRouteId = _.flow(
  _.split('/'),
  _.compact,
  _.filter((part) => !['(', '['].includes(part[0])),
  _.zipObject(['pageType', 'displayStyle']),
  setFieldWith('isPrint', 'pageType', _.includes('print')),
)

// Page meta data.
export function getPageMeta(url, params, route) {
  const routeId = route.id
  const search = params.searchHash ? searchHashParse(params.searchHash) : {}
  const routeInfo = parseRouteId(routeId)
  if (routeInfo.displayStyle === 'grid') {
    search.hasImage = true
  }
  const metaInit = {
    categoryId: search.categoryId || _.getOr(null, 'filters.categoryId', search),
    search,
    routeId,
  }
  const meta = _.mergeAll([
    DEFAULT_META, getUrlInfo(url, params.isAdmin), routeInfo, params, metaInit,
  ])
  return meta
}
