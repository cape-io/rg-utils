import _ from 'lodash/fp.js'
import { setFieldWith } from 'prairie'
import { searchHashParse } from './search-hash.js'

export const defaultMeta = {
  currentPage: 1,
  displayStyle: 'grid',
  pageType: 'collection',
}
const appInfo = {
  archive: {
    id: 'archive',
    siteId: 'archivefinetextiles',
    search: { filters: { matches: { discontinued: true } } },
    isArchive: true,
  },
  rg: {
    id: 'rg',
    siteId: 'rogersandgoffigon',
    search: { filters: { matches: { discontinued: false, appCode: 'rg' } } },
  },
  dl: {
    id: 'dl',
    siteId: 'delanyandlong',
    search: { filters: { matches: { discontinued: false, appCode: 'dl' } } },
  },
  admin: {
    id: 'admin',
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
    categoryId: search.categoryId || _.getOr(null, 'filters.matches.categoryId', search),
    search,
    routeId,
  }
  const meta = _.mergeAll([
    defaultMeta, getUrlInfo(url, params.isAdmin), routeInfo, params, metaInit,
  ])
  return meta
}
