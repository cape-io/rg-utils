import { getUrlInfo, parseRouteId, getPageMeta } from './meta.js'

/* global describe, expect, test */

describe('parseRouteId', () => {
  test('sections', () => {
    expect(parseRouteId('/(app)/collection/detail/[searchHash]')).toEqual({
      displayStyle: 'detail',
      pageType: 'collection',
      isPrint: false,
    })
  })
  test('no section', () => {
    expect(parseRouteId('/collection/detail/[searchHash]')).toEqual({
      displayStyle: 'detail',
      pageType: 'collection',
      isPrint: false,
    })
  })
  test('api', () => {
    expect(parseRouteId('api/patterns/[searchHash]')).toEqual({
      displayStyle: 'patterns',
      pageType: 'api',
      isPrint: false,
    })
  })
})
const rgUrl = { hostname: 'rg.local' }
describe('getUrlInfo', () => {
  test('rg', () => {
    expect(getUrlInfo(rgUrl)).toEqual({
      appCode: 'rg',
      appId: 'rg',
      siteId: 'rogersandgoffigon',
      isArchive: false,
      // search: { filters: { matches: { appCode: 'rg', discontinued: false } } },
    })
  })
  test('dl', () => {
    expect(getUrlInfo({ hostname: 'dl.local' })).toEqual({
      appCode: 'dl',
      appId: 'dl',
      siteId: 'delanyandlong',
      isArchive: false,
      // search: { filters: { matches: { appCode: 'dl', discontinued: false } } },
    })
  })
})
describe('getPageMeta', () => {
  test('rg', () => {
    const params = {
      searchHash: 'csnl',
    }
    const route = {
      id: '/api/patterns/[searchHash]',
    }
    expect(getPageMeta(rgUrl, params, route)).toEqual({
      appCode: 'rg',
      appId: 'rg',
      categoryId: null,
      pager: {
        currentPage: 1,
        perPage: 96,
      },
      displayStyle: 'patterns',
      isArchive: false,
      isPrint: false,
      pageType: 'api',
      routeId: route.id,
      siteId: 'rogersandgoffigon',
      searchHash: params.searchHash,
      search: {
        filters: {
          colors: ['natural'],
          // matches: { appCode: 'rg', discontinued: false },
        },
      },
    })
  })
  test('admin', () => {
    const params = {
      searchHash: 'cgtl_csgd',
      displayStyle: 'detail',
      isAdmin: true, // important that this gets set
    }
    const route = {
      id: '/api/patterns/[searchHash]',
    }
    expect(getPageMeta(rgUrl, params, route)).toEqual({
      appCode: null,
      appId: 'rg',
      categoryId: 'textile',
      pager: {
        currentPage: 1,
        perPage: 96,
      },
      displayStyle: 'detail',
      isArchive: false,
      isPrint: false,
      pageType: 'api',
      routeId: route.id,
      siteId: 'admin',
      isAdmin: true,
      searchHash: params.searchHash,
      search: {
        filters: {
          colors: ['gold'],
          categoryId: 'textile',
        },
      },
    })
  })
})
