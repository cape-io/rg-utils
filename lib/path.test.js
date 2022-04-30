import {
  collectionPathParse, collectionPathEncode, collectionPathParseEncode,
  getDisplaySort, hasValidIdChars,
  isPatternPart, itemIdParts, itemUrl,
  searchHashEncode, searchHashPrep, validIdChars,
  queryEncode,
} from './path.js'

/* global describe, expect, test */
const defaultMeta = {
  currentPage: 1,
  displayStyle: 'grid',
  pageType: 'collection',
}
const displayStyles = [
  {
    columnOrder: [
      'name',
      'id',
      'images',
      'color',
      'price',
      'content',
      'repeat',
      'approxWidth',
      'approxSize',
      'approxThick',
    ],
    label: 'List',
    sortByOptions: [
      {
        label: 'A-Z',
        sortBy: 'name',
        value: 'name',
      },
    ],
    value: 'list',
  },
  {
    label: 'Grid',
    sortByOptions: [
      {
        label: 'A-Z',
        sortBy: 'pattern___name',
        sortPath: 'pattern.name',
        value: 'name',
      },
      {
        label: 'Color',
        sortBy: 'colorPosition',
        sortPath: 'colorPosition',
        value: 'color',
      },
    ],
    value: 'grid',
  },
  {
    hidden: true,
    label: 'Grid Color',
    sortByOptions: [
      {
        label: 'Color',
        sortBy: 'colorPosition',
        sortPath: 'colorPosition',
        value: 'color',
      },
    ],
    value: 'grid-color',
  },
  {
    hidden: true,
    label: 'Detail',
    perPage: 1,
    sortByOptions: [
      {
        value: null,
      },
    ],
    value: 'detail',
  },
  {
    hidden: true,
    label: 'Detail Debug',
    perPage: 1,
    sortByOptions: [
      {
        value: null,
      },
    ],
    value: 'detailx',
  },
]
describe('getDisplaySort', () => {
  test('list', () => {
    expect(getDisplaySort(displayStyles)('list')).toBe('name')
  })
})

describe('searchHashEncode', () => {
  test('itemId + filters', () => {
    const search = {
      itemId: '91009-01',
      filters: { cg: ['tl'] },
    }
    expect(searchHashEncode(search)).toBe('cgtl_sr91009-01')
  })
  test('query over itemId', () => {
    const search = {
      itemId: '91009-01',
      query: '91009-02',
    }
    expect(searchHashEncode(search)).toBe('91009-02')
  })
})
describe('searchHashPrep', () => {
  // Issue #179
  test('allow space at end', () => {
    expect(searchHashPrep('foo%20')).toBe('foo ')
    expect(searchHashPrep('foo \t')).toBe('foo ')
    expect(searchHashPrep('foo\r')).toBe('foo ')
    expect(searchHashPrep('srfoo%20')).toBe('srfoo ')
  })
})
describe('queryEncode', () => {
  // Issue #179
  test('allow space at end', () => {
    expect(queryEncode('foo ', false)).toBe('foo%20')
    expect(queryEncode('foo \t', false)).toBe('foo%20')
    expect(queryEncode('foo\r')).toBe('srfoo%20')
  })
})

describe('collectionPathParse', () => {
  test('handle wildcard searchHash', () => {
    const pathInput = '/collection/%5B...%5D/'
    const parsed = collectionPathParse(defaultMeta)(pathInput)
    expect(parsed).toEqual({
      pathInput,
      currentPage: 1,
      displayStyle: 'grid',
      pageType: 'collection',
      perPage: 48,
      search: { filters: {} },
      searchHash: '[...]',
      sortSlug: 'name',
      path: '/collection/any/grid/name/48/1',
    })
  })
  test('handle basic static path', () => {
    const pathInput = '/collection/textile/grid/name/24/2'
    const parsed = collectionPathParse(defaultMeta)(pathInput)
    expect(parsed).toEqual({
      pathInput,
      currentPage: 2,
      displayStyle: 'grid',
      pageType: 'collection',
      perPage: 24,
      search: { filters: { cg: ['tl'] } },
      searchHash: 'textile',
      sortSlug: 'name',
      path: pathInput,
    })
  })
  test('handle any category', () => {
    const pathInput = '/collection/any/grid/name/24/2'
    const parsed = collectionPathParse(defaultMeta)(pathInput)
    expect(parsed).toEqual({
      pathInput,
      currentPage: 2,
      displayStyle: 'grid',
      pageType: 'collection',
      perPage: 24,
      search: { filters: {} },
      searchHash: 'any',
      sortSlug: 'name',
      path: pathInput,
    })
  })
  test('item detail', () => {
    const pathInput = '/collection/710014-01/detail'
    expect(collectionPathParse(defaultMeta)(pathInput))
      .toEqual({
        pathInput,
        currentPage: 1,
        displayStyle: 'detail',
        pageType: 'collection',
        perPage: 1,
        search: { filters: {}, itemId: '710014-01', query: '710014-01' },
        searchHash: '710014-01',
        sortSlug: null,
        path: pathInput,
      })
  })
  test('item detail pager', () => {
    const pathInput = '/collection/cgtl_sr91044/detail/name/1/2'
    expect(collectionPathParse(defaultMeta)('/collection/cgtl_sr91044/detail/name/1/2'))
      .toEqual({
        pathInput,
        currentPage: 2,
        displayStyle: 'detail',
        pageType: 'collection',
        perPage: 1,
        search: { filters: { cg: ['tl'] }, query: '91044' },
        searchHash: 'cgtl_sr91044',
        sortSlug: 'name',
        path: pathInput,
      })
  })
  test('item search', () => {
    const pathInput = '/collection/710014-01/grid/name/48/1'
    expect(collectionPathParse(defaultMeta)(pathInput))
      .toEqual({
        pathInput,
        currentPage: 1,
        displayStyle: 'grid',
        pageType: 'collection',
        perPage: 48,
        search: { filters: {}, itemId: '710014-01', query: '710014-01' },
        searchHash: '710014-01',
        sortSlug: 'name',
        path: pathInput,
      })
  })
  test('single search term', () => {
    const pathInput = '/collection/blue/grid/name/48/1'
    expect(collectionPathParse(defaultMeta)(pathInput))
      .toEqual({
        pathInput,
        currentPage: 1,
        displayStyle: 'grid',
        pageType: 'collection',
        perPage: 48,
        search: { filters: {}, query: 'blue' },
        searchHash: 'blue',
        sortSlug: 'name',
        path: pathInput,
      })
  })
})

describe('collectionPathEncode', () => {
  test('empty meta', () => {
    expect(collectionPathEncode(defaultMeta)({}))
      .toBe('/collection/any/grid/color/48/1')
  })
  test('single search query only', () => {
    expect(collectionPathEncode(defaultMeta)({ search: { query: 'blu' } }))
      .toBe('/collection/blu/grid/color/48/1')
    expect(collectionPathEncode(defaultMeta)({ search: { query: 'bl u' } }))
      .toBe('/collection/bl%20u/grid/color/48/1')
  })
  test('category only', () => {
    expect(collectionPathEncode(defaultMeta)({ categorySlug: 'textile' }))
      .toBe('/collection/textile/grid/color/48/1')
  })
  test('item detail', () => {
    expect(collectionPathEncode(defaultMeta)({
      search: { itemId: '710014-01' },
      displayStyle: 'detail',
    })).toBe('/collection/710014-01/detail')
  })
  test('list default sort', () => {
    const result = collectionPathEncode(defaultMeta)({
      displayStyle: 'list', categorySlug: 'textile',
    })
    expect(result).toBe('/collection/textile/list/name/48/1')
  })
})

describe('collectionPathParseEncode', () => {
  test('single filter', () => {
    const path5 = '/collection/cthp/grid/color/48/1'
    expect(collectionPathParseEncode(path5)).toBe(path5)
  })
})

describe('itemUrl', () => {
  test('basic item detail encode', () => {
    expect(itemUrl(defaultMeta, '710014-01'))
      .toBe('/collection/710014-01/detail')
  })
})
