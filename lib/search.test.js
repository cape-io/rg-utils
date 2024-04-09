import _ from 'lodash/fp.js'
import { createFilterFunc } from './search.js'
import { getPatternColorItems } from './items.js'
import pattern from './_pattern.js'

/* global describe, expect, test */

const items = getPatternColorItems(pattern)

describe('createFilterFunc', () => {
  test('categoryId textile', () => {
    const filters = { categoryId: 'textile' }
    const filterFunc = createFilterFunc(filters)
    const results = items.filter(filterFunc)
    expect(results.length).toBe(6)
  })
  test('categoryId trim', () => {
    const filters = { categoryId: 'trim' }
    const filterFunc = createFilterFunc(filters)
    const results = items.filter(filterFunc)
    expect(results.length).toBe(0)
  })
  test('active textile', () => {
    const filters = {
      matches: { discontinued: false },
      categoryId: 'textile',
    }
    const filterFunc = createFilterFunc(filters)
    const results = items.filter(filterFunc)
    expect(results.length).toBe(3)
  })
  test('rg active textile', () => {
    const filters = {
      matches: { discontinued: false, appCode: 'rg' },
      categoryId: 'textile',
    }
    const filterFunc = createFilterFunc(filters)
    const results = items.filter(filterFunc)
    expect(results.length).toBe(3)
  })
})
