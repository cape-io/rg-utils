import {
  filterOpts, getFilterCounts, getFiltersWithCounts, keysAbove0,
} from './filter.js'
import { getPatternColorItems } from './items.js'
import pattern from './_pattern.js'

/* global describe, expect, test */

const colorItems = getPatternColorItems(pattern)

describe('filterOpts', () => {
  test('added count: 0', () => {
    expect(filterOpts).toMatchObject({
      colors: {
        value: null,
        options: {
          black: { count: 0 },
          blue: { count: 0 },
        },
      },
      contents: {
        value: null,
        options: {},
      },
      designs: {
        value: null,
        options: {
          brush: { count: 0 },
        },
      },
    })
  })
})
const filterCounts = getFilterCounts(colorItems)
describe('getFilterCounts', () => {
  test('adds counts', () => {
    expect(filterCounts).toMatchObject({
      appCode: {
        dl: 0,
        rg: 6,
      },
      category: {
        textile: 6,
        leather: 0,
      },
      colors: {
        black: 0,
        blue: 2,
        gold: 1,
        green: 3,
        natural: 1,
        pink: 0,
        offWhite: 1,
        purple: 1,
      },
      contents: {
        linen: 6,
        hemp: 0,
      },
      designs: {
        solid: 6,
        print: 0,
      },
      tags: {
        discontinued: 0,
      },
    })
  })
})
const filterCount = {
  appCode: {
    rg: 6,
  },
  category: {
    textile: 6,
  },
  colors: {
    blue: 2,
    gold: 1,
    green: 3,
    natural: 1,
    offWhite: 1,
    purple: 1,
  },
  contents: {
    linen: 6,
  },
  designs: {
    solid: 6,
  },
  tags: {},
}
describe('keysAbove0', () => {
  test('only counts over 0', () => {
    expect(keysAbove0(filterCounts)).toEqual(filterCount)
  })
})
describe('getFiltersWithCounts', () => {
  test('only counts over 0', () => {
    expect(getFiltersWithCounts(colorItems)).toEqual(filterCount)
  })
})
