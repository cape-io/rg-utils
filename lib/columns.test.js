import _ from 'lodash/fp.js'
import { getItemColumns, getSectionColumns } from './columns.js'

import { getPageMeta } from './meta.js'
import { getPatternColorItems } from './items.js'
import pattern from './_pattern.js'

/* global describe, expect, test */

const searchResults = getPatternColorItems(pattern)

describe('getItemColumns', () => {
  const params = { searchHash: '91024-01' }
  const item = searchResults.find(_.matchesProperty('itemId', params.searchHash))
  const url = { hostname: 'rg.local' }
  const route = { id: '/(app)/collection/detail/[searchHash]' }
  const pageMeta = getPageMeta(url, params, route)
  test('valid cat', () => {
    expect(getItemColumns(pageMeta, item)).toEqual([{
      field: {
        collection: 'pattern', fields: ['name', 'id'], id: 'nameId', label: 'Pattern Name & Id (item#)', valuePath: ['pattern.name', 'id'],
      },
      fieldId: 'nameId',
      hideOnGrid: false,
      hideOnList: true,
      index: 2,
      label: 'Fabric',
      labelOfField: 'name',
    }, {
      field: {
        collection: 'color', id: 'color', label: 'Color', valuePath: 'color',
      },
      fieldId: 'color',
      index: 4,
      label: 'Color',
      printWhenColor: {
        collection: 'color', id: 'color', label: 'Color', valuePath: 'color',
      },
    }, {
      field: {
        collection: 'pattern', id: 'content', label: 'Content', valuePath: 'pattern.content',
      },
      fieldId: 'content',
      index: 5,
      label: 'Content',
      rowSpan: true,
    }, {
      field: {
        collection: 'pattern', id: 'approxWidth', label: 'Approx Width', valuePath: 'pattern.approxWidth',
      },
      fieldId: 'approxWidth',
      index: 7,
      label: 'Approx Width',
    }])
  })
})
describe('getSectionColumns', () => {
  const params = { searchHash: '91024' }
  const url = { hostname: 'rg.local' }
  const route = { id: '/(app)/collection/list/[searchHash]' }
  const pageMeta = getPageMeta(url, params, route)

  test('any cat', () => {
    const cols = getSectionColumns(pageMeta)
    expect(cols[0]).toMatchObject(
      {
        fieldId: 'name',
      },
    )
    expect(cols[1]).toMatchObject(
      {
        fieldId: 'id',
      },
    )
  })
})
