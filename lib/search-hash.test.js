import {
  addSearchFilter, rmSearchFilter,
  searchHashEncode, searchHashParse, queryEncode, searchHashPrep,
} from './search-hash.js'

/* global describe, expect, test */

describe('searchHashParse', () => {
  test('category hashes', () => {
    expect(searchHashParse('textile')).toEqual({
      filters: {
        // cg: ['tl'],
        categoryId: 'textile',
      },
    })
    expect(searchHashParse('cgtl')).toEqual({
      filters: {
        // cg: ['tl'],
        categoryId: 'textile',
      },
    })
    expect(searchHashParse('leather')).toEqual({
      filters: {
        // cg: ['lr'],
        categoryId: 'leather',
      },
    })
    expect(searchHashParse('passementerie')).toEqual({
      filters: {
        // cg: ['pr'],
        categoryId: 'trim',
      },
    })
  })
  test('search query strings', () => {
    expect(searchHashParse('foo')).toEqual({
      filters: {},
      query: 'foo',
    })
    expect(searchHashParse('linen')).toEqual({
      filters: {},
      query: 'linen',
    })
    expect(searchHashParse('sring')).toEqual({
      filters: {},
      query: 'sring',
    })
    expect(searchHashParse('1001')).toEqual({
      filters: {},
      query: '1001',
    })
  })
  test('prefixSearch', () => {
    expect(searchHashParse('^1001')).toEqual({
      filters: {},
      prefix: true,
      query: '1001',
    })
  })
  test('searchHashParse', () => {
    expect(searchHashParse('^white')).toEqual({
      filters: {
        matches: { colorPrimary: 'white' },
      },
    })
    expect(searchHashParse('any')).toEqual({
      filters: {},
    })
    expect(searchHashParse('performance')).toEqual({
      filters: { designs: ['performance'] },
    })
    expect(searchHashParse('summersale')).toEqual({
      filters: {
        tags: ['discontinued'],
      },
    })
  })
  test('valid colorId', () => {
    expect(searchHashParse('91009-02')).toEqual({
      filters: {},
      itemId: '91009-02',
      query: '91009-02',
    })
  })
  test('white space filterCodes', () => {
    expect(searchHashParse(' csbg ')).toEqual({
      filters: {
        colors: ['beige'],
      },
    })
    const searchHash = 'csbk '
    expect(searchHashParse(searchHash)).toEqual({
      filters: {
        colors: ['black'],
      },
    })
  })
  test('return short codes', () => {
    expect(searchHashParse('cgtl_srfoo', false)).toEqual({
      filters: {
        cg: ['tl'],
      },
      query: 'foo',
    })
  })
  test('filterCodes', () => {
    expect(searchHashParse('dnpf')).toEqual({
      filters: {
        designs: ['performance'],
      },
    })
    expect(searchHashParse('dnpfsd')).toEqual({
      filters: {
        designs: ['performance', 'solid'],
      },
    })
    expect(searchHashParse('cgtl_csgdgn')).toEqual({
      filters: {
        colors: ['gold', 'green'],
        categoryId: 'textile',
      },
    })
    expect(searchHashParse('cglr_csbk')).toEqual({
      filters: {
        colors: ['black'],
        categoryId: 'leather',
      },
    })
    expect(searchHashParse('cgtl_csgdgn_ctln_dnsp_srcottage')).toEqual({
      filters: {
        colors: ['gold', 'green'],
        contents: ['linen'],
        designs: ['stripe'],
        categoryId: 'textile',
      },
      query: 'cottage',
    })
  })
})
describe('queryEncode', () => {
  // Issue #179
  test('allow space at end', () => {
    expect(queryEncode('foo ', false)).toBe('foo%20')
    expect(queryEncode('foo \t', false)).toBe('foo%20')
    expect(queryEncode('foo\r')).toBe('srfoo%20')
  })
  test('allow space at end', () => {
    expect(queryEncode('foo ', false)).toBe('foo%20')
    expect(queryEncode('foo \t', false)).toBe('foo%20')
    expect(queryEncode('foo\r')).toBe('srfoo%20')
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
  test('alias', () => {
    expect(searchHashPrep('summersale')).toBe('tgdd')
  })
})

describe('searchHashEncode', () => {
  test('empty search', () => {
    const search = {}
    expect(searchHashEncode(search)).toBe('any')
  })
  test('itemId + filters', () => {
    const search = {
      itemId: '91009-01',
      filters: { cg: ['tl'] },
    }
    expect(searchHashEncode(search)).toBe('cgtl_sr91009-01')
    const search2 = {
      itemId: '91009-01',
      filters: { categoryId: 'textile' },
    }
    expect(searchHashEncode(search2)).toBe('cgtl_sr91009-01')
  })
  test('query over itemId', () => {
    const search = {
      itemId: '91009-01',
      query: '91009-02',
    }
    expect(searchHashEncode(search)).toBe('91009-02')
  })
  test('only query string', () => {
    const search = {
      query: 'foo',
    }
    expect(searchHashEncode(search)).toBe('foo')
  })
  test('categoryId with query', () => {
    const search = {
      query: 'foo',
      filters: { categoryId: 'textile', colors: [], foo: 'bar' },
    }
    expect(searchHashEncode(search)).toBe('cgtl_srfoo')
  })
  test('categoryId only', () => {
    const search = {
      filters: { categoryId: 'textile' },
    }
    expect(searchHashEncode(search)).toBe('textile')
  })
  test('only query string. sr prefix last', () => {
    const search = {
      query: 'foo',
      filters: { cg: ['tl'], colors: ['black'] },
    }
    expect(searchHashEncode(search)).toBe('cgtl_csbk_srfoo')
  })
  test('invalid value id', () => {
    const search = {
      filters: { colors: ['foo'] },
    }
    expect(searchHashEncode(search)).toEqual('any')
  })
  test('perf', () => {
    const search = {
      filters: { designs: ['performance'] },
    }
    expect(searchHashEncode(search)).toEqual('performance') // dnpf
  })
})
describe('addSearchFilter', () => {
  test('add color', () => {
    expect(addSearchFilter('csbk ', 'colors', 'beige')).toBe('csbgbk')
    expect(addSearchFilter('csbg ', 'colors', 'black')).toBe('csbgbk')
    expect(addSearchFilter('leather', 'colors', 'black')).toBe('cglr_csbk')
    expect(addSearchFilter('cglr_csbk', 'colors', 'beige')).toBe('cglr_csbgbk')
  })
  test('add color', () => {
    expect(addSearchFilter('leather', 'colors', ['black', 'beige', 'gold', 'nocolor'])).toBe('cglr_csbgbkgd')
  })
  test('invalid val', () => {
    expect(addSearchFilter('csbk', 'colorss', 'beige')).toBe(null)
    expect(addSearchFilter('csbk', 'colors', 'black')).toBe(null)
  })
  test('adding same color', () => {
    expect(addSearchFilter('csbk', 'colors', 'black')).toBe(null)
  })
})
describe('rmSearchFilter', () => {
  test('rm color not in hash', () => {
    expect(rmSearchFilter('csbk', 'colors', 'beige')).toBe(null)
  })
  test('invalid val', () => {
    expect(rmSearchFilter('csbk', 'colorss', 'beige')).toBe(null)
    expect(rmSearchFilter('csbk', 'colors', 'blakc')).toBe(null)
  })
  test('rm color', () => {
    expect(rmSearchFilter('csbk ', 'colors', 'black')).toBe('any')
    expect(rmSearchFilter('csgd_sr9300010', 'colors', 'gold')).toBe('9300010')
    expect(rmSearchFilter('cstn_dnpf', 'colors', 'tan')).toBe('performance')
  })
  test('rm colors', () => {
    expect(rmSearchFilter('cglr_csbgbk', 'colors', ['beige', 'black'])).toBe('leather')
    expect(rmSearchFilter('cglr_csbgbk', 'colors', ['black', 'beige'])).toBe('leather')
  })
})
