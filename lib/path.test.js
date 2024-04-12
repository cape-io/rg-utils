import {
  // collectionPathParse, collectionPathEncode, collectionPathParseEncode,
  detailPathParts,
  getDisplaySort,
} from './path.js'
// import { DEFAULT_META } from './meta.js'

/* global describe, expect, test */

// const fieldCodes = {
//   cg: 'category',
//   cs: 'colors',
//   ct: 'contents',
//   dn: 'designs',
//   tg: 'tags',
// }
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
// const coderInfo = init({ categories })
describe('getDisplaySort', () => {
  test('list', () => {
    expect(getDisplaySort(displayStyles)('list')).toBe('name')
  })
})
describe('detailPathParts', () => {
  test('contains all', () => {
    expect(detailPathParts).toEqual(['pageType', 'displayStyle', 'searchHash'])
  })
})

// describe('collectionPathParse', () => {
//   const info = { DEFAULT_META }
//   test('handle wildcard searchHash', () => {
//     const pathInput = '/collection/%5B...%5D/'
//     const parsed = collectionPathParse(info)(pathInput)
//     expect(parsed).toEqual({
//       pathInput,
//       currentPage: 1,
//       displayStyle: 'grid',
//       pageType: 'collection',
//       perPage: 48,
//       search: { filters: {} },
//       searchHash: '[...]',
//       sortSlug: 'name',
//       path: '/collection/any/grid/name/48/1',
//     })
//   })
//   test('handle basic static path', () => {
//     const pathInput = '/collection/textile/grid/name/24/2'
//     const parsed = collectionPathParse(info)(pathInput)
//     expect(parsed).toEqual({
//       pathInput,
//       currentPage: 2,
//       displayStyle: 'grid',
//       pageType: 'collection',
//       perPage: 24,
//       search: { filters: { cg: ['tl'] } },
//       searchHash: 'textile',
//       sortSlug: 'name',
//       path: pathInput,
//     })
//   })
//   test('handle any category', () => {
//     const pathInput = '/collection/any/grid/name/24/2'
//     const parsed = collectionPathParse(info)(pathInput)
//     expect(parsed).toEqual({
//       pathInput,
//       currentPage: 2,
//       displayStyle: 'grid',
//       pageType: 'collection',
//       perPage: 24,
//       search: { filters: {} },
//       searchHash: 'any',
//       sortSlug: 'name',
//       path: pathInput,
//     })
//   })
//   test('item detail', () => {
//     const pathInput = '/collection/710014-01/detail'
//     expect(collectionPathParse(info)(pathInput))
//       .toEqual({
//         pathInput,
//         currentPage: 1,
//         displayStyle: 'detail',
//         pageType: 'collection',
//         perPage: 1,
//         search: { filters: {}, itemId: '710014-01', query: '710014-01' },
//         searchHash: '710014-01',
//         sortSlug: null,
//         path: pathInput,
//       })
//   })
//   test('item detail pager', () => {
//     const pathInput = '/collection/cgtl_sr91044/detail/name/1/2'
//     expect(collectionPathParse(info)('/collection/cgtl_sr91044/detail/name/1/2'))
//       .toEqual({
//         pathInput,
//         currentPage: 2,
//         displayStyle: 'detail',
//         pageType: 'collection',
//         perPage: 1,
//         search: { filters: { cg: ['tl'] }, query: '91044' },
//         searchHash: 'cgtl_sr91044',
//         sortSlug: 'name',
//         path: pathInput,
//       })
//   })
//   test('item search', () => {
//     const pathInput = '/collection/710014-01/grid/name/48/1'
//     expect(collectionPathParse(info)(pathInput))
//       .toEqual({
//         pathInput,
//         currentPage: 1,
//         displayStyle: 'grid',
//         pageType: 'collection',
//         perPage: 48,
//         search: { filters: {}, itemId: '710014-01', query: '710014-01' },
//         searchHash: '710014-01',
//         sortSlug: 'name',
//         path: pathInput,
//       })
//   })
//   test('single search term', () => {
//     const pathInput = '/collection/blue/grid/name/48/1'
//     expect(collectionPathParse(info)(pathInput))
//       .toEqual({
//         pathInput,
//         currentPage: 1,
//         displayStyle: 'grid',
//         pageType: 'collection',
//         perPage: 48,
//         search: { filters: {}, query: 'blue' },
//         searchHash: 'blue',
//         sortSlug: 'name',
//         path: pathInput,
//       })
//   })
// })

// describe('collectionPathEncode', () => {
//   test('empty meta', () => {
//     expect(collectionPathEncode(DEFAULT_META)({}))
//       .toBe('/collection/any/grid/color/48/1')
//   })
//   test('single search query only', () => {
//     expect(collectionPathEncode(DEFAULT_META)({ search: { query: 'blu' } }))
//       .toBe('/collection/blu/grid/color/48/1')
//     expect(collectionPathEncode(DEFAULT_META)({ search: { query: 'bl u' } }))
//       .toBe('/collection/bl%20u/grid/color/48/1')
//   })
//   test('category only', () => {
//     expect(collectionPathEncode(DEFAULT_META)({ categorySlug: 'textile' }))
//       .toBe('/collection/textile/grid/color/48/1')
//   })
//   test('item detail', () => {
//     expect(collectionPathEncode(DEFAULT_META)({
//       search: { itemId: '710014-01' },
//       displayStyle: 'detail',
//     })).toBe('/collection/710014-01/detail')
//   })
//   test('list default sort', () => {
//     const result = collectionPathEncode(DEFAULT_META)({
//       displayStyle: 'list', categorySlug: 'textile',
//     })
//     expect(result).toBe('/collection/textile/list/name/48/1')
//   })
// })

// describe('collectionPathParseEncode', () => {
//   test('single filter', () => {
//     const path5 = '/collection/cthp/grid/color/48/1'
//     expect(collectionPathParseEncode(path5)).toBe(path5)
//   })
// })

// describe('itemUrl', () => {
//   test('basic item detail encode', () => {
//     expect(itemUrl(DEFAULT_META, '710014-01'))
//       .toBe('/collection/710014-01/detail')
//   })
// })
