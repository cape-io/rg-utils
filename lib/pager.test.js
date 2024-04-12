import { getPagerInfo } from './pager.js'

/* global describe, expect, test */

describe('getPagerInfo', () => {
  test('info', () => {
    expect(getPagerInfo(1000, 48, 0)).toEqual({
      currentPage: 1,
      pageCount: 21,
      maxIndex: 20,
      pageIndex: 0,
      perPage: 48,
      skip: 0,
      itemsTotal: 1000,
      itemsOnPage: 48,
      hasNextPage: true,
      hasPreviousPage: false,
    })
  })
  test('last page', () => {
    expect(getPagerInfo(1000, 48, 20)).toEqual({
      currentPage: 21,
      pageCount: 21,
      maxIndex: 20,
      pageIndex: 20,
      perPage: 48,
      skip: 960,
      itemsTotal: 1000,
      itemsOnPage: 40,
      hasNextPage: false,
      hasPreviousPage: true,
    })
  })
  test('index too low', () => {
    expect(getPagerInfo(1000, 48, -10)).toMatchObject({
      currentPage: 1,
      pageIndex: 0,
      skip: 0,
      hasPreviousPage: false,
    })
  })
  test('index too high', () => {
    expect(getPagerInfo(1000, 48, 1110)).toMatchObject({
      currentPage: 21,
      pageCount: 21,
      skip: 960,
      hasNextPage: false,
    })
  })
  test('small first page', () => {
    expect(getPagerInfo(12, 48, 0)).toMatchObject({
      currentPage: 1,
      itemsTotal: 12,
      pageIndex: 0,
      itemsOnPage: 12,
      pageCount: 1,
      maxIndex: 0,
      skip: 0,
      hasNextPage: false,
    })
  })
})
