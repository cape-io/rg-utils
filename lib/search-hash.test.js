import {
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
  test('search strings', () => {
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
  test('simpleSearch', () => {
    expect(searchHashParse('^white')).toEqual({
      filters: {
        matches: { colorPrimary: 'white' },
      },
    })
    expect(searchHashParse('any')).toEqual({
      filters: {},
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
  test('filterCodes', () => {
    expect(searchHashParse('cgtl_srfoo')).toEqual({
      filters: {
        matches: { categoryId: 'textile' },
      },
      query: 'foo',
    })
    expect(searchHashParse('cgtl_csgdgn')).toEqual({
      filters: {
        colors: ['gold', 'green'],
        matches: { categoryId: 'textile' },
      },
    })
    expect(searchHashParse('cgtl_csgdgn_ctln_dnsp_srcottage')).toEqual({
      filters: {
        colors: ['gold', 'green'],
        contents: ['linen'],
        designs: ['stripe'],
        matches: { categoryId: 'textile' },
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
  test('only query string. sr prefix last', () => {
    const search = {
      query: 'foo',
      filters: { cg: ['tl'] },
    }
    expect(searchHashEncode(search)).toBe('cgtl_srfoo')
  })
})
