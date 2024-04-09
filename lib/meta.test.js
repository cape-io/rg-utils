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
      siteId: 'rogersandgoffigon',
      search: { filters: { matches: { appId: 'rg', discontinued: false } } },
    })
  })
  test('rg', () => {
    expect(getUrlInfo({ hostname: 'dl.local' })).toEqual({
      siteId: 'delanyandlong',
      search: { filters: { matches: { appId: 'dl', discontinued: false } } },
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
      categoryId: null,
      currentPage: 1,
      displayStyle: 'patterns',
      isPrint: false,
      pageType: 'api',
      routeId: route.id,
      siteId: 'rogersandgoffigon',
      searchHash: params.searchHash,
      search: {
        filters: {
          colors: ['natural'],
          matches: { appId: 'rg', discontinued: false },
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
      categoryId: 'textile',
      currentPage: 1,
      displayStyle: 'detail',
      isPrint: false,
      pageType: 'api',
      routeId: route.id,
      siteId: 'admin',
      isAdmin: true,
      searchHash: params.searchHash,
      search: {
        filters: {
          colors: ['gold'],
          matches: { categoryId: 'textile' },
        },
      },
    })
  })
})
